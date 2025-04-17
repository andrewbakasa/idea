"use client";

import { toast } from "sonner";
import { AlignLeft, Copy, Download, Search , } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useRef, ElementRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import jsPDF from 'jspdf';
import html2canvas from "html2canvas";
import Moment from 'moment'
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/update-card";
import { CardWithList, CardWithList2, SafeCardWithList2 } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { cn, isJsonStringEditorCompatible } from "@/lib/utils";
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import { Separator } from "@radix-ui/react-separator";
import { differenceInDays, format, isValid } from "date-fns";
// import puppeteer from 'puppeteer';

import { Editor as Editor2, EditorState, convertToRaw,
  convertFromRaw ,
  ContentState,
  convertFromHTML,
  // BlockMap,
  ContentBlock,
  BlockMapBuilder,
  Modifier,
  SelectionState,
  DraftInlineStyle,
  DefaultDraftInlineStyle,
  RichUtils,
  BlockMap,
  CharacterMetadata
} from 'draft-js';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';


import dynamic from "next/dynamic";
import { ACTION, Card, ENTITY_TYPE, Tag } from "@prisma/client";
import { SafeCard } from "@/app/types";
import { createAudit } from "@/actions/create-audit-log";
import { updateBoard } from "@/actions/update-board";
import { useCardIDToRefreshStore } from "@/hooks/use-refreshedCard";
import { FaRulerCombined } from "react-icons/fa";
import { OrderedSet } from "immutable";
import moment from "moment";
import { stateToHTML } from "draft-js-export-html";
import { TbPdf } from "react-icons/tb";
import { handleSummarize } from "@/app/summarizeText";


type ProgressStatus = "not_started" | "wip" | "stabbled" | "complete";
type ProgressLabel = "Not Started" | "WIP" | "Stabbled" | "Complete";

const values: Record<ProgressStatus, ProgressLabel> = {
    "not_started": "Not Started",
    "wip": "WIP",
    "stabbled": "Stabbled",
    "complete": "Complete"
};

const Editor = dynamic(() => import('react-draft-wysiwyg').then(mod => mod.Editor), { ssr: false });



interface DescriptionProps {
  data: CardWithList;
  dataList:CardWithList[];
  boardId:string;
  setActivityViewMode:(value:boolean) => void;
};
const HIGHLIGHT_TYPE = 'HIGHLIGHT';

// const HIGHLIGHT_STYLE: DraftInlineStyle = 'HIGHLIGHT'; // Define as a string

export const Description = ({
  data,
  dataList=[],
  boardId,
  setActivityViewMode
}: DescriptionProps) => {
  // const params = useParams();
  const queryClient = useQueryClient();
  const labelsOnlyTagIDs = data?.tagIDs
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const checkboxRef = useRef<ElementRef<"input">>(null);
  
  let [note, setNote] = useState("")
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
   
  // const [category,setCategory]=useState<string>('')//x==''?null:x)//tag);
  const {setCardIDToRefreshState}=useCardIDToRefreshStore();
  const enableEditing = () => {
    setIsEditing(true);
    setActivityViewMode(false)
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  }

  const disableEditing = () => {
    setIsEditing(false);
    setActivityViewMode(true)
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
     // disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  let getNote = () => {
    if (data?.description !==undefined && data?.description !==null) {
        if (isJsonStringEditorCompatible(data?.description||"")){
            try {
                const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));  
                setEditorState(EditorState.createWithContent(DBEditorState)); 
                setNote(JSON.stringify(DBEditorState))
            } catch {


                const placeholder= ''
                //toast.error("Your data has corrupt format. Please rewrite")
                // console.log('Data with errors:', data?.description)
                const { contentBlocks, entityMap } = convertFromHTML(placeholder);
                const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                setEditorState(EditorState.createWithContent(contentState)); 
                setNote(JSON.stringify(contentState)) 
          
            }
           
        }else{
            //const processedHTML = DraftPasteProcessor.processHTML(data.description);
            const { contentBlocks, entityMap } = convertFromHTML(data.description);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);    
            setEditorState(EditorState.createWithContent(contentState)); 
            setNote(JSON.stringify(contentState)) 
        }

    }else {
        const placeholder= ''
       
     
        const { contentBlocks, entityMap } = convertFromHTML(placeholder);
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        setEditorState(EditorState.createWithContent(contentState)); 
        setNote(JSON.stringify(contentState)) 
        
    }

  }
  useEffect(()=>{
    getNote()
  },[])
  interface BlockData {
    key: string; // Unique identifier for the block
    type: string; // Block type (e.g., 'unstyled', 'header-one', 'blockquote')
    text: string; // Text content of the block
    depth: number; // Indentation level 
    // ... other potential properties
  }
  interface EntityData {
    type: string; // Entity type (e.g., 'LINK', 'IMAGE')
    mutability: 'MUTABLE' | 'IMMUTABLE' | 'SEGMENTED'; 
    data: any; // Custom data associated with the entity (e.g., { url: 'https://example.com' } for a link)
  }
  interface MyEntityData {
    color?: string;
    size?: number;
  }

  const handleDownloadPdfReplacedFinal =async (): Promise<void> => {
   
    try {
      const htmlString = stateToHTML(editorState.getCurrentContent()); 
  
      const doc = new jsPDF(); 
      const element = document.createElement('div');
      element.innerHTML = htmlString;
  
      // Find and temporarily hide the iframe
      const iframe = element.querySelector('iframe'); 
      if (iframe) {
        iframe.style.display = 'none'; 
  
        // Wait for iframe content to load (if applicable)
        await new Promise((resolve) => {
          iframe.onload = resolve;
        });
      }
  
      const html2canvasOptions = {
        scale: 2, 
        width: doc.internal.pageSize.getWidth(), 
        useCORS: true, // Try enabling if dealing with cross-origin iframes
      };
  
      // Capture the entire element (including the hidden iframe)
      const canvas = await html2canvas(element, html2canvasOptions); 
      const imgData = canvas.toDataURL('image/png');
  
      // Add the first page to the PDF
      doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  
      // Handle page splitting (if needed)
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 0;
  
      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);
  
        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentY = 0;
        }
  
        // Create a new canvas for each page
        const clippedCanvas = await html2canvas(element, { 
          scale: 2, 
          width: doc.internal.pageSize.getWidth(), 
          useCORS: true, // Try enabling if dealing with cross-origin iframes
          windowWidth: doc.internal.pageSize.getWidth(), 
          windowHeight: pageHeightToUse, 
          x: 0, 
          y: currentY 
        });
        const clippedImgData = clippedCanvas.toDataURL('image/png');
  
        doc.addImage(clippedImgData, 'PNG', 0, currentY, clippedCanvas.width, pageHeightToUse);
  
        currentY += pageHeightToUse;
      }
  
      // Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
  
      const newDate = new Date();
      const _date = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(newDate);
      const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
      const fileName2 = `${fileName}-${_date}.pdf`;
      doc.save(fileName2);
  
      document.body.removeChild(element);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  const handleDownloadPdfLast = async (): Promise<void> => {
    try {
      const htmlString = stateToHTML(editorState.getCurrentContent()); 
  
      const doc = new jsPDF(); 
      const element = document.createElement('div');
      element.innerHTML = htmlString;
      //console.log('here 1.........................................')
      // Find and temporarily hide the iframe
      const iframe = element.querySelector('iframe'); 
      if (iframe) {
        iframe.style.display = 'none'; 
  
        // Wait for iframe content to load (if applicable)
        await new Promise((resolve) => {
          iframe.onload = resolve;
        });
  
        // Inspect the cloned iframe (using browser developer tools)
       // console.log("Cloned iframe structure:", iframe);
     }
  
      const html2canvasOptions = {
        scale: 2, 
        width: doc.internal.pageSize.getWidth(), 
        useCORS: true, // Try enabling if dealing with cross-origin iframes
      };
      //console.log('here 2.........................................')
     
      // Capture the entire element (including the hidden iframe)
      const canvas = await html2canvas(element, html2canvasOptions); 
     // console.log('here 2.5.........................................')
 
      const imgData = canvas.toDataURL('image/png');
  
      // Add the first page to the PDF
      doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  
      // Handle page splitting (if needed)
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 0;
  
      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);
      // console.log('here 2.5.........................................')
     
        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentY = 0;
        }
        //console.log('here 3.........................................')
     
        // Create a new canvas for each page
        const clippedCanvas = await html2canvas(element, { 
          scale: 2, 
          width: doc.internal.pageSize.getWidth(), 
          useCORS: true, // Try enabling if dealing with cross-origin iframes
          windowWidth: doc.internal.pageSize.getWidth(), 
          windowHeight: pageHeightToUse, 
          x: 0, 
          y: currentY 
        });
        const clippedImgData = clippedCanvas.toDataURL('image/png');
        //console.log('here 4.........................................')
     
        doc.addImage(clippedImgData, 'PNG', 0, currentY, clippedCanvas.width, pageHeightToUse);
  
        currentY += pageHeightToUse;
      }
      //console.log('here out.........................................')
 
      //Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
  
      const newDate = new Date();
      const _date = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(newDate);
      const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
      const fileName2 = `<span class="math-inline">\{fileName\}\-</span>{_date}.pdf`;
      doc.save(fileName2);
  
      //document.body.removeChild(element);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };  
  
  const handleDownloadPdf12 = async (): Promise<void> => {
    /*  
    
    This code incorporates the following:

    Simplified Iframe Handling: Temporarily hides the iframe before capturing the element and restores its visibility afterward.
    Page Splitting: Handles content that overflows a single page by creating multiple canvases and capturing clipped portions of the element.
    html2canvas Options: Includes useCORS for potential cross-origin issues.
    Error Handling: Includes a basic try...catch block to handle potential errors during PDF generation.
    This code provides a more robust and refined solution for capturing content with iframes and generating PDFs using html2canvas. Remember to test it thoroughly in your specific environment to ensure it meets your requirements.

    If you continue to encounter errors, please provide more details about your implementation, such as:

    Iframe content: A simplified example of the content within the iframe.
    Browser and environment: The browser and operating system you are using.
    Any specific error messages: More detailed error messages that might be helpful for debugging.
   
    */
    try {
      const htmlString = stateToHTML(editorState.getCurrentContent()); 
  
      const doc = new jsPDF(); 
      const element = document.createElement('div');
      element.innerHTML = htmlString;
  
      // Find and temporarily hide the iframe
      const iframe = element.querySelector('iframe'); 
      if (iframe) {
        iframe.style.display = 'none'; 
  
        // Wait for iframe content to load (if applicable)
        await new Promise((resolve) => {
          iframe.onload = resolve;
        });
      }
  
      const html2canvasOptions = {
        scale: 2, 
        width: doc.internal.pageSize.getWidth(), 
        useCORS: true, // Try enabling if dealing with cross-origin iframes
        logging: true // Enable logging for debugging
      };
  
      // Create a temporary container to hold the element
      const container = document.createElement('div');
      container.appendChild(element);
      document.body.appendChild(container); 
  
      // Capture the entire element (including the hidden iframe)
      const canvas = await html2canvas(container, html2canvasOptions); 
      container.remove(); // Remove the temporary container
  
      const imgData = canvas.toDataURL('image/png');
  
      // Add the first page to the PDF
      doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  
      // Handle page splitting (if needed)
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 0;
  
      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);
  
        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentY = 0;
        }
  
        // Create a new canvas for each page
        const clippedCanvas = await html2canvas(element, { 
          ...html2canvasOptions, 
          windowWidth: doc.internal.pageSize.getWidth(), 
          windowHeight: pageHeightToUse, 
          x: 0, 
          y: currentY 
        });
        const clippedImgData = clippedCanvas.toDataURL('image/png');
  
        doc.addImage(
            clippedImgData, 'PNG', 0, currentY, 
            100,//clippedCanvas.width, 
            pageHeightToUse
        );
  
        currentY += pageHeightToUse;
      }
  
      // Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
  
      const newDate = new Date();
      const _date = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(newDate);
      const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
      const fileName2 = `${fileName}-${_date}.pdf`;
      doc.save(fileName2);
  
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadPdf_now_better = async (): Promise<void> => {
    try {
      const htmlString = stateToHTML(editorState.getCurrentContent()); 
  
      const doc = new jsPDF({
        format: 'a4',
        unit: 'mm',
      }); 
      const element = document.createElement('div');
      element.innerHTML = htmlString;
  
      // Find and temporarily hide the iframe
      const iframe = element.querySelector('iframe'); 
      if (iframe) {
        iframe.style.display = 'none'; 
      }
  
      const html2canvasOptions = {
        scale: 2, 
        width: doc.internal.pageSize.getWidth(), 
        useCORS: true, 
      };
  
      // Capture the entire element (including the hidden iframe)
      //const canvas = await html2canvas(element, html2canvasOptions);
      
      
      // Create a temporary container to hold the element
      const container = document.createElement('div');
      container.appendChild(element);
      document.body.appendChild(container); 
  
      // Capture the entire element (including the hidden iframe)
      const canvas = await html2canvas(container, html2canvasOptions); 
      container.remove(); // Remove the temporary container
  
      // const imgData = canvas.toDataURL('image/png');


  
      // // Add the first page to the PDF
      // doc.addImage(imgData,
      //   'PNG', 0, 0, 
      //  100,//canvas.width
      //  canvas.height
      // );
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
  
      const marginLeft = 15; 
      const marginTop = 15;
      const marginRight = 15;
      const marginBottom = 15; 
      const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
      const pageHeight = doc.internal.pageSize.getHeight() - marginTop - marginBottom;
  
      doc.addImage(imgData, 'PNG', marginLeft, marginTop, pageWidth, pageHeight);
  
  
      // Handle page splitting (if needed)
      const contentHeight = element.scrollHeight;
      //const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 0;
  
      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);
  
        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentY = 0;
        }
  
        // Create a temporary container for each page
        const clippedContainer = document.createElement('div');
        clippedContainer.style.height = `${pageHeightToUse}px`; 
        clippedContainer.style.overflow = 'hidden'; 
        clippedContainer.appendChild(element.cloneNode(true)); 
  
        // Capture the clipped portion of the element
        const clippedCanvas = await html2canvas(clippedContainer, { 
          ...html2canvasOptions, 
          width: doc.internal.pageSize.getWidth(), 
        }); 
  
        const clippedImgData = clippedCanvas.toDataURL('image/png');
  
        doc.addImage(clippedImgData, 'PNG', 0, currentY, clippedCanvas.width, pageHeightToUse);
  
        currentY += pageHeightToUse;
        clippedContainer.remove(); // Remove the temporary container
      }
  
      // Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
  
      const newDate = new Date();
      const _date = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(newDate);
      const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
      const fileName2 = `${fileName}-${_date}.pdf`;
      doc.save(fileName2);
  
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const handleDownloadPdf_alternative = async () => {
    const doc = new jsPDF({
      format: 'a4',
      unit: 'mm',
    });
  
    const htmlString = stateToHTML(editorState.getCurrentContent());
  
    try {
      // const canvas = await html2canvas(document.getElementById('your-html-element-id'), {
      //   scale: 2, 
      // });

      const element = document.createElement('div');
      element.innerHTML = htmlString;
  
      // Find and temporarily hide the iframe
      const iframe = element.querySelector('iframe'); 
      if (iframe) {
        iframe.style.display = 'none'; 
      }
      const html2canvasOptions = {
        scale: 1, 
        width: doc.internal.pageSize.getWidth(), 
        useCORS: true, // Try enabling if dealing with cross-origin iframes
        logging: true // Enable logging for debugging
      };
  
      // Create a temporary container to hold the element
      const container = document.createElement('div');
      container.appendChild(element);
      document.body.appendChild(container); 
  
      // Capture the entire element (including the hidden iframe)
      const canvas = await html2canvas(container, html2canvasOptions); 
      container.remove(); // Remove the temporary container
  
     
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
  
      const marginLeft = 15; 
      const marginTop = 15;
      const marginRight = 15;
      const marginBottom = 15; 
      const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
      const pageHeight = doc.internal.pageSize.getHeight() - marginTop - marginBottom;
  
      doc.addImage(imgData, 'PNG', marginLeft, marginTop, pageWidth, pageHeight);
  
      doc.save('my-document.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  const [htmlString, setHtmlString] = useState(`
    <h1>Hello from HTML!</h1>
    <p>This is a paragraph.</p>
  `);
  const handleDownloadPdfSimpleAndWorking = () => {
    const doc = new jsPDF();

    const htmlString = stateToHTML(editorState.getCurrentContent()); 
  

      // Use the html() method to convert HTML to PDF
      doc.html(htmlString, {
        callback: function (doc) {
          doc.save('my-document.pdf');
        }
      });
  };

  const [pdfData, setPdfData] = useState<string | null>(null);

  const generatePdf99= async () => {
    try {
      // const doc = new PDFDocument();
      // const stream = doc.pipe(new PassThrough()) as Writable; 
      // const htmlString = stateToHTML(editorState.getCurrentContent()); 
  
      // doc.text(htmlString); 
      // doc.end();

      // const chunks: Uint8Array[] = [];
      // stream.on('data', (chunk) => chunks.push(chunk));

      // const blob:any = new Blob(chunks, { type: 'application/pdf' }); 
      // const url = URL.createObjectURL(blob); // Explicit type assertion here

      // setPdfData(url); 
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
 
const generatePdfworking = () => {
  const doc = new jsPDF({
      format: 'a4', // Set A4 page format
      unit: 'mm', // Set units to millimeters (common for PDF margins)
    
  });
  const htmlString = stateToHTML(editorState.getCurrentContent());
  //console.log('Text:', htmlString)
  doc.setFontSize(8); 
  doc.html(htmlString, {
    callback: (doc) => {
      // Set default font size
      doc.setFontSize(1); 
      // Apply styles within the HTML string 
      const styledHtml = htmlString.replace(
        /<h1\b[^>]*>([\s\S]*?)<\/h1>/g, 
        '<h1 style="font-size: 11px;">$1</h1>' 
      );

      // Render the styled HTML
      doc.html(styledHtml, {}); 
      const newDate = new Date();
      const _date= Moment(newDate).format('YYYY_MMMM_DD-HHmmss') ;
      const fileName= data?.title?`${data?.title.substring(0,10)}`:'myDocument';
      let fileName2 =fileName + _date;

      doc.save(`${fileName2}.pdf`);
    },
    // Correct margin definition: array of 4 values 
   margin: [10, 10, 10, 10], // [top, right, bottom, left] in millimeters, // [top, right, bottom, left]
    // x: 0,
    // y: 0,
    width:4000,
    html2canvas: { 
      scale: 0.3, 
      width:1000
  },
 
  });
};
const getSummary =()=>{
  const htmlString = stateToHTML(editorState.getCurrentContent());
  //sumarize text.....
  handleSummarize(htmlString)
}
const generatePdf = () => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
   // putOnlyUsedFonts:true
   });
  

  // const htmlString = stateToHTML(editorState.getCurrentContent());
    // Use the provided htmlString if available, otherwise use the existing logic
   const htmlString = stateToHTML(editorState.getCurrentContent());
    
    // Leverage html2canvas for flexible HTML rendering
  doc.html(htmlString, {
    callback: (doc) => {
      const newDate = new Date();
      const _date = Moment(newDate).format('YYYY_MMMM_DD-HHmmss');
      const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
      const fileName2 = fileName + _date;

      doc.save(`${fileName2}.pdf`);
    },
    margin: [10, 10, 10, 10], // [top, right, bottom, left] in millimeters
    width: 470-20,//doc.internal.pageSize.getWidth() - 20, // Set width to full PDF width with some margin
    windowWidth:470,// doc.internal.pageSize.getWidth() - 20, 
    html2canvas: {
      width: 470-20,//doc.internal.pageSize.getWidth() - 20, 
      scale: 0.4, // Adjust scaling factor as needed
      letterRendering: true 
    }
  });
  doc.setLineHeightFactor(.5); // Adjust as needed (default is 1.15)
   doc.setCharSpace(0.1);
  // doc.setDisplayMode()
    doc.setFontSize(8);
  // doc.setDocumentProperties();
  // doc.setProperties();
 
};
const generatePdf2 = async( ) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
   // putOnlyUsedFonts:true
   });
  

  
  
  // Get the summarized HTML string using await
  const htmlString = await handleSummarize(stateToHTML(editorState.getCurrentContent()));

  doc.html(htmlString, {
    callback: (doc) => {
      const newDate = new Date();
      const _date = Moment(newDate).format('YYYY_MMMM_DD-HHmmss');
      const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
      const fileName2 = fileName + _date;

      doc.save(`${fileName2}.pdf`);
    },
    margin: [10, 10, 10, 10], // [top, right, bottom, left] in millimeters
    width: 470-20,//doc.internal.pageSize.getWidth() - 20, // Set width to full PDF width with some margin
    windowWidth:470,// doc.internal.pageSize.getWidth() - 20, 
    html2canvas: {
      width: 470-20,//doc.internal.pageSize.getWidth() - 20, 
      scale: 0.4, // Adjust scaling factor as needed
      letterRendering: true 
    }
  });
  doc.setLineHeightFactor(.5); // Adjust as needed (default is 1.15)
   doc.setCharSpace(0.1);
  // doc.setDisplayMode()
    doc.setFontSize(8);
  // doc.setDocumentProperties();
  // doc.setProperties();
 
};

// const handleSummarize = async (text:string) => {
//   // setIsLoading(true);

//   try {
//     const response = await fetch('/api/summarize', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ text }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to fetch: ${response.status}`);
//     }

//     const data = await response.json();
//     // setSummary(data.summary);
//     console.log("sumarized===>:",  data.summary);
//     return data.summary
//     // const DBEditorState = convertFromRaw(JSON.parse(data?.summary||""));  
//     // setEditorState(EditorState.createWithContent(DBEditorState));
//   } catch (error:any) {
//     console.error('Error summarizing text:', error.toString());
    
//     // const DBEditorState = convertFromRaw(JSON.parse(error.toString()));  
//     // setEditorState(EditorState.createWithContent(DBEditorState)); 
//     return ''
//   } finally {
//     // setIsLoading(false);
//   }
// };


// const summarised= (textToSummarize:string)=>{
//     // Example Usage
//     //const textToSummarize = "This is the text you want to summarize.";

//     summarizeTextWithGroqCloud(textToSummarize)
//       .then((summary: any) => {
//         if (summary) { 
//           console.log('Summary:', summary); 
//         } else {
//           console.log('No summary generated.'); 
//         }
//       })
//       .catch((error: any) => {
//         console.error('Error:', error);
//       });
// }
const handleDownloadPdf= async () => {// old version cuurrent working
  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm',
  });

  // const htmlString = stateToHTML(editorState.getCurrentContent());
    // Use the provided htmlString if available, otherwise use the existing logic
  let htmlString = stateToHTML(editorState.getCurrentContent());
  //sumarize text.....



  try {
    // Prepare the HTML for sentence-per-line rendering
    const modifiedHtml = htmlString
      .replace(/<\/p>/g, '</p><br/>') // Add line breaks after each paragraph
      .replace(/\. /g, '.<br/>'); // Add line breaks after each sentence

    // Create a temporary div to hold the modified HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modifiedHtml;
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, {
      scale: 1, 
    });

    document.body.removeChild(tempDiv); // Remove the temporary div

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const marginLeft = 15; 
    const marginTop = 15;
    const marginRight = 15;
    const marginBottom = 15; 

    
    const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
    const pageHeight = doc.internal.pageSize.getHeight() - marginTop - marginBottom;

    doc.addImage(imgData, 'PNG', marginLeft, marginTop, pageWidth, pageHeight);

    const newDate = new Date();
    const _date= Moment(newDate).format('YYYY_MMMM_DD-HHmmss') ;
    const fileName= data?.title?`${data?.title.substring(0,10)}`:'myDocument';
    let fileName2 =fileName + _date;

    doc.save(`${fileName2}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};


const handleDownloadPdfReplaced = async () => {//current better version
  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm',
  });

  const htmlString = stateToHTML(editorState.getCurrentContent());
  //console.log('Text:', htmlString);

  try {
    // Prepare the HTML for sentence-per-line rendering
    const modifiedHtml = htmlString
      .replace(/<\/p>/g, '</p><br/>') // Add line breaks after each paragraph
      .replace(/\. /g, '.<br/>'); // Add line breaks after each sentence

    // Create a temporary div to hold the modified HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modifiedHtml;
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, {
      scale: 1, 
    });

    document.body.removeChild(tempDiv); // Remove the temporary div

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    

    const marginLeft = 15; 
    const marginTop = 15;
    const marginRight = 15;
    const marginBottom = 15; 
    const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight; 
    const pageHeight = doc.internal.pageSize.getHeight() - marginTop - marginBottom;

    let positionY = marginTop; 
    let remainingHeight = imgHeight; 

    while (remainingHeight > 0) {
      const heightOnPage = Math.min(remainingHeight, pageHeight - positionY); 
      doc.addImage(imgData, 'PNG', marginLeft, positionY, pageWidth, heightOnPage); 
      positionY += heightOnPage; 
      remainingHeight -= heightOnPage; 

      if (remainingHeight > 0) {
        doc.addPage(); 
        positionY = marginTop; 
      }
    }

    const newDate = new Date();
    const _date= Moment(newDate).format('YYYY_MMMM_DD-HHmmss') ;
    const fileName= data?.title?`${data?.title.substring(0,10)}`:'myDocument';
    let fileName2 =fileName + _date;

    doc.save(`${fileName2}.pdf`);
   // doc.save('my-document.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};



const handleDownloadPdfNotWorking = async () => {
  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm',
  });

  const htmlString = stateToHTML(editorState.getCurrentContent());

  try {
    // Prepare the HTML for sentence-per-line rendering
    const modifiedHtml = htmlString
      .replace(/<\/p>/g, '</p><br/>')
      .replace(/\. /g, '.<br/>');

    // Create a temporary div to hold the modified HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modifiedHtml;
    document.body.appendChild(tempDiv);

    // Wait for images to load before measuring height
    await new Promise<void>(resolve => {
      const images = tempDiv.querySelectorAll('img');
      if (images.length === 0) {
        resolve();
      } else {
        const imageLoaders = Array.from(images)?.map(img => new Promise<void>(resolveImageLoaded => {
          img.onload = () => resolveImageLoaded(); 
        }));
        Promise.all(imageLoaders).then(() => resolve());
      }
    });


    // Calculate initial scale based on page height and actual div height
    const pageHeight = doc.internal.pageSize.getHeight() - 30; // Adjust margin as needed
    const divHeight = tempDiv.scrollHeight; 

    // **Initial Scale Calculation:**
    // Calculate a more conservative initial scale to avoid overscaling initially
    let initialScale = Math.min(1, pageHeight / divHeight); 

    // Iterative Scaling with Adjustments
    const maxIterations = 10; // Increase iterations for better accuracy
    const scalingFactor = 0.98; // Adjust scaling factor for finer adjustments

    for (let i = 0; i < maxIterations; i++) {
      const canvas = await html2canvas(tempDiv, { scale: initialScale });
      const renderedHeight = canvas.height; 

      // Calculate the scaling factor dynamically based on the difference 
      const heightDiff = pageHeight - renderedHeight;
      const scaleAdjustment = 1 + (heightDiff / renderedHeight) * 0.1; // Adjust the 0.1 factor as needed
      initialScale *= scaleAdjustment; 
    }

    const canvas = await html2canvas(tempDiv, { scale: initialScale });
    document.body.removeChild(tempDiv); 

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const marginLeft = 15; 
    const marginTop = 15;
    const marginRight = 15;
    const marginBottom = 15; 
    const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight; 

    let positionY = marginTop; 
    let remainingHeight = imgHeight; 

    while (remainingHeight > 0) {
      const heightOnPage = Math.min(remainingHeight, pageHeight - positionY); 
      doc.addImage(imgData, 'PNG', marginLeft, positionY, pageWidth, heightOnPage); 
      positionY += heightOnPage; 
      remainingHeight -= heightOnPage; 

      if (remainingHeight > 0) {
        doc.addPage(); 
        positionY = marginTop; 
      }
    }

    const newDate = new Date();
    const _date= Moment(newDate).format('YYYY_MMMM_DD-HHmmss') ;
    const fileName= data?.title?`${data?.title.substring(0,10)}`:'myDocument';
    let fileName2 =fileName + _date;

    doc.save(`${fileName2}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

// const handleDownloadPdf = async () => {
//   const htmlString = stateToHTML(editorState.getCurrentContent()); 

//   try {
//     const browser = await puppeteer.launch(); 
//     const page = await browser.newPage();

//     await page.setContent(htmlString);

//     const pdfBuffer = await page.pdf({
//       format: 'A4',
//       margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }, 
//     });

//     // Download the PDF (e.g., using a Blob and download link)
//     const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'document.pdf';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     URL.revokeObjectURL(url); 

//     await browser.close(); 
//   } catch (error) {
//     console.error('Error generating PDF:', error);
//   }
// };

const handleDownloadPdf11 = async () => {
  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm',
  });

  const htmlString = stateToHTML(editorState.getCurrentContent());

  try {
    // Prepare the HTML for sentence-per-line rendering
    const modifiedHtml = htmlString
      .replace(/<\/p>/g, '</p><br/>')
      .replace(/\. /g, '.<br/>');

    // Create a temporary div to hold the modified HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = modifiedHtml;
    document.body.appendChild(tempDiv);

    // Wait for images to load before measuring height
    const waitForImagesToLoad = (): Promise<void> => { 
        return new Promise(resolve => { 
          const images = tempDiv.querySelectorAll('img');
          if (images.length === 0) {
            resolve(); 
          } else {
            const imageLoaders = Array.from(images)?.map(img => new Promise<void>(resolveImageLoaded => { 
              img.onload = () => resolveImageLoaded(); 
            }));
            Promise.all(imageLoaders).then(() => resolve()); // Correct: Use an empty arrow function
          }
        });
      };
    await waitForImagesToLoad();

    // Calculate initial scale based on page height and actual div height
    const pageHeight = doc.internal.pageSize.getHeight() - 30; // Adjust margin as needed
    const divHeight = tempDiv.getBoundingClientRect().height;
    let initialScale = pageHeight / divHeight;

    // Iterative scaling for better accuracy (optional)
    const maxIterations = 5; 
    for (let i = 0; i < maxIterations; i++) {
      const canvas = await html2canvas(tempDiv, { scale: initialScale });
      const renderedHeight = canvas.height; 

      // Adjust scale based on rendered height
      initialScale = initialScale * (pageHeight / renderedHeight); 
    }

    const canvas = await html2canvas(tempDiv, { scale: initialScale });
    document.body.removeChild(tempDiv); 

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const marginLeft = 15; 
    const marginTop = 15;
    const marginRight = 15;
    const marginBottom = 15; 
    const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight; 

    let positionY = marginTop; 
    let remainingHeight = imgHeight; 

    while (remainingHeight > 0) {
      const heightOnPage = Math.min(remainingHeight, pageHeight - positionY); 
      doc.addImage(imgData, 'PNG', marginLeft, positionY, pageWidth, heightOnPage); 
      positionY += heightOnPage; 
      remainingHeight -= heightOnPage; 

      if (remainingHeight > 0) {
        doc.addPage(); 
        positionY = marginTop; 
      }
    }

    const newDate = new Date();
    const _date= Moment(newDate).format('YYYY_MMMM_DD-HHmmss') ;
    const fileName= data?.title?`${data?.title.substring(0,10)}`:'myDocument';
    let fileName2 =fileName + _date;

    doc.save(`${fileName2}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

const handleDownloadPdfcurr = async () => {//testing thid
  const doc = new jsPDF({
    format: 'a4',
    unit: 'mm',
  });

  const htmlString = stateToHTML(editorState.getCurrentContent());
  //console.log('Text:', htmlString);

  try {
    const tempDiv = document.createElement('div');
    tempDiv.style.whiteSpace = 'pre-wrap';
    tempDiv.innerHTML = htmlString; 
    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, { scale: 1 }); 
    document.body.removeChild(tempDiv); 

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;

    const marginLeft = 15;
    const marginTop = 15;
    const marginRight = 15;
    const marginBottom = 15;
    const pageWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
    const pageHeight = doc.internal.pageSize.getHeight() - marginTop - marginBottom;

    let positionY = marginTop;
    let remainingHeight = imgHeight;

    while (remainingHeight > 0) {
      const heightOnPage = Math.min(remainingHeight, pageHeight - positionY);
      doc.addImage(imgData, 'PNG', marginLeft, positionY, pageWidth, heightOnPage);
      positionY += heightOnPage;
      remainingHeight -= heightOnPage;

      if (remainingHeight > 0) {
        doc.addPage();
        positionY = marginTop; 
      }
    }

    doc.save('my-document.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error); 
  }
};
  const handleDownloadPdf123 = async (): Promise<void> => {
    try {
      const htmlString = stateToHTML(editorState.getCurrentContent()); 
  
      const doc = new jsPDF(); 
      const element = document.createElement('div');
      element.innerHTML = htmlString;
  
      // Find and temporarily hide the iframe
      const iframe = element.querySelector('iframe'); 
      if (iframe) {
        iframe.style.display = 'none'; 
      }
  
      const html2canvasOptions = {
        scale: 2, 
        width: doc.internal.pageSize.getWidth(), 
        useCORS: true, 
      };
  
      
      // Create a temporary container to hold the element
      const container = document.createElement('div');
      container.appendChild(element);
      document.body.appendChild(container); 
  
      // Capture the entire element (including the hidden iframe)
      const canvas = await html2canvas(container, html2canvasOptions); 
      container.remove(); // Remove the temporary container
  
      // Add the first page to the PDF
      // doc.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  
      // Handle page splitting (if needed)
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentY = 0;
  
      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);
  
        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentY = 0;
        }
  
        // Create a temporary container for each page
        const clippedContainer = document.createElement('div');
        clippedContainer.style.height = `${pageHeightToUse}px`; 
        clippedContainer.style.overflow = 'hidden'; 
        clippedContainer.appendChild(element.cloneNode(true)); 
  
        // Capture the clipped portion of the element
        const clippedCanvas = await html2canvas(clippedContainer, { 
          ...html2canvasOptions, 
          width: doc.internal.pageSize.getWidth(), 
        }); 
        // const clippedImgData = clippedCanvas.toDataURL('image/png');
  
        // Get the data URL of the canvas
        const pageDataUrl = clippedCanvas.toDataURL('image/png'); 
  
        // Add the image to the PDF
        doc.addImage(pageDataUrl, 'PNG', 0, currentY, clippedCanvas.width, pageHeightToUse);
  
        currentY += pageHeightToUse;
        clippedContainer.remove(); // Remove the temporary container
      }
  
      // Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
  
      const newDate = new Date();
      const _date = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(newDate);
      const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
      const fileName2 = `${fileName}-${_date}.pdf`;
      doc.save(fileName2);
  
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };
  const handleDownloadPdfWorkingVersion = async (): Promise<void> => {

         try {
              const htmlString = stateToHTML(editorState.getCurrentContent());
              console.log('pre--',htmlString)
           
              const doc = new jsPDF();
              //const doc= new jsPDF('l', 'pt', 'a4')
              const element = document.createElement('div');
              element.innerHTML = htmlString;
              document.body.appendChild(element);
          
              await html2canvas(element, {
                // Optional canvas configuration:
                scale: 1,//2, // Adjust scaling factor for higher resolution (if needed)
                width: doc.internal.pageSize.getWidth(), // Set canvas width to match PDF page width
                height: doc.internal.pageSize.getHeight(),
              }).then((canvas:any) => {
                const imgData = canvas.toDataURL('image/png');
                 // Calculate image dimensions based on canvas and PDF page sizes:
                const imgWidth = canvas.width / canvas.scale; // Adjust for scaling
                const imgHeight = (imgWidth * canvas.height) / canvas.width;

                // Add image to PDF with calculated dimensions:
                doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
              });
             // doc.addPage(htmlString)

             let newDate = new Date();
             const _date= Moment(newDate).format('YYYY_MMMM_DD-HHmmss') ;
             const fileName= data?.title?`${data?.title.substring(0,10)}`:'myDocument';
             let fileName2 =fileName + _date;
             doc.save(fileName2);
          
              // Clean up (remove temporary element)
              document.body.removeChild(element);
            } catch (error) {
              console.error('Error generating PDF:', error);
          }
  };
    


const handleDownloadPdfold = async (): Promise<void> => {
  try {
    const htmlString = stateToHTML(editorState.getCurrentContent()); 

    const doc = new jsPDF(); 
    const element = document.createElement('div');
    element.innerHTML = htmlString;
    element.style.maxHeight = '100vh'; 
    element.style.overflowY = 'auto'; 

    document.body.appendChild(element);

    await html2canvas(element, {
      scale: 2, 
      width: doc.internal.pageSize.getWidth(), 
    }).then(async (canvas: any) => { 
      const imgData = canvas.toDataURL('image/png');

      // Calculate image dimensions based on canvas and PDF page sizes:
      const imgWidth = canvas.width / canvas.scale;
      const imgHeight = (imgWidth * canvas.height) / canvas.width;

      // Add image to PDF with calculated dimensions:
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Check if content overflows the current page and add new pages if needed
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentPage = 1;
      let currentY = 0;

      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);

        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentPage++;
          currentY = 0;
        }

        const clippedElement = element.cloneNode(true) as HTMLElement;
        clippedElement.style.maxHeight = `${pageHeightToUse}px`;
        clippedElement.style.overflow = 'hidden'; 

        try {
          const clippedCanvas = await html2canvas(clippedElement, {
            scale: 2, 
            width: doc.internal.pageSize.getWidth(), 
          });
          const clippedImgData = clippedCanvas.toDataURL('image/png');

          doc.addImage(clippedImgData, 'PNG', 0, currentY, imgWidth, pageHeightToUse);
        } catch (clippedCanvasError) {
          console.error("Error rendering clipped canvas:", clippedCanvasError); 
          // Handle the error gracefully (e.g., log, skip the current page, etc.)
        }

        currentY += pageHeightToUse;
      }
    });

    const newDate = new Date();
    const _date = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(newDate);
    const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
    const fileName2 = `${fileName}-${_date}.pdf`;
    doc.save(fileName2);

    document.body.removeChild(element);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

const handleDownloadPdf23 = async (): Promise<void> => {
  try {
    const htmlString = stateToHTML(editorState.getCurrentContent()); 

    const doc = new jsPDF(); 
    const element = document.createElement('div');
    element.innerHTML = htmlString;

    // Temporarily hide the iframe
    const iframe = element.querySelector('iframe'); 
    if (iframe) {
      iframe.style.display = 'none'; 
    }

    await html2canvas(element, {
      scale: 2, 
      width: doc.internal.pageSize.getWidth(), 
    }).then(async (canvas: any) => { 
      const imgData = canvas.toDataURL('image/png');

      // Calculate image dimensions based on canvas and PDF page sizes:
      const imgWidth = canvas.width / canvas.scale;
      const imgHeight = (imgWidth * canvas.height) / canvas.width;

      // Add image to PDF with calculated dimensions:
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Check if content overflows the current page and add new pages if needed
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentPage = 1;
      let currentY = 0;

      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);

        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentPage++;
          currentY = 0;
        }

        const clippedElement = element.cloneNode(true) as HTMLElement;
        clippedElement.style.maxHeight = `${pageHeightToUse}px`;
        clippedElement.style.overflow = 'hidden'; 

        try {
          const clippedCanvas = await html2canvas(clippedElement, {
            scale: 2, 
            width: doc.internal.pageSize.getWidth(), 
          });
          const clippedImgData = clippedCanvas.toDataURL('image/png');

          doc.addImage(clippedImgData, 'PNG', 0, currentY, imgWidth, pageHeightToUse);
        } catch (clippedCanvasError) {
          console.error("Error rendering clipped canvas:", clippedCanvasError); 
          // Handle the error gracefully (e.g., log, skip the current page, etc.)
        }

        currentY += pageHeightToUse;
      }

      // Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
    });

    const newDate = new Date();
    const _date = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(newDate);
    const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
    const fileName2 = `${fileName}-${_date}.pdf`;
    doc.save(fileName2);

    document.body.removeChild(element);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
const handleDownloadPdf24 = async (): Promise<void> => {
  try {
    const htmlString = stateToHTML(editorState.getCurrentContent()); 

    const doc = new jsPDF(); 
    const element = document.createElement('div');
    element.innerHTML = htmlString;

    // Temporarily hide the iframe
    const iframe = element.querySelector('iframe'); 
    if (iframe) {
      iframe.style.display = 'none'; 
    }

    const html2canvasOptions = {
      scale: 2, 
      width: doc.internal.pageSize.getWidth(), 
    };

    await html2canvas(element, html2canvasOptions)
    .then(async (canvas: HTMLCanvasElement) => { 
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = canvas.width; 
      const imgHeight = canvas.height; 

      // Add image to PDF with calculated dimensions:
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Check if content overflows the current page and add new pages if needed
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentPage = 1;
      let currentY = 0;

      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);

        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentPage++;
          currentY = 0;
        }

        const clippedElement = element.cloneNode(true) as HTMLElement;
        clippedElement.style.maxHeight = `${pageHeightToUse}px`;
        clippedElement.style.overflow = 'hidden'; 

        try {
          const clippedCanvas = await html2canvas(clippedElement, html2canvasOptions);
          const clippedImgData = clippedCanvas.toDataURL('image/png');

          doc.addImage(clippedImgData, 'PNG', 0, currentY, imgWidth, pageHeightToUse);
        } catch (clippedCanvasError) {
          console.error("Error rendering clipped canvas:", clippedCanvasError); 
          // Handle the error gracefully (e.g., log, skip the current page, etc.)
        }

        currentY += pageHeightToUse;
      }

      // Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
    });

    const newDate = new Date();
    const _date = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(newDate);
    const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
    const fileName2 = `${fileName}-${_date}.pdf`;
    doc.save(fileName2);

    document.body.removeChild(element);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};
const handleDownloadPdfnotworkin = async (): Promise<void> => {
  try {
    const htmlString = stateToHTML(editorState.getCurrentContent()); 

    const doc = new jsPDF(); 
    const element = document.createElement('div');
    element.innerHTML = htmlString;

    // Temporarily hide the iframe
    const iframe = element.querySelector('iframe'); 
    if (iframe) {
      iframe.style.display = 'none'; 

      // Wait for iframe content to load (if applicable)
      await new Promise((resolve) => {
        iframe.onload = resolve;
      });
    }

    const html2canvasOptions = {
      scale: 2, 
      width: doc.internal.pageSize.getWidth(), 
      useCORS: true, // Try enabling if dealing with cross-origin iframes
    };

    await html2canvas(element, html2canvasOptions)
    .then(async (canvas: HTMLCanvasElement) => { 
      const imgData = canvas.toDataURL('image/png');

      const imgWidth = canvas.width; 
      const imgHeight = canvas.height; 

      // Add image to PDF with calculated dimensions:
      doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Check if content overflows the current page and add new pages if needed
      const contentHeight = element.scrollHeight;
      const pageHeight = doc.internal.pageSize.getHeight();
      let currentPage = 1;
      let currentY = 0;

      while (currentY < contentHeight) {
        const remainingHeight = contentHeight - currentY;
        const pageHeightToUse = Math.min(remainingHeight, pageHeight);

        if (pageHeightToUse < contentHeight) {
          doc.addPage();
          currentPage++;
          currentY = 0;
        }

        const clippedElement = element.cloneNode(true) as HTMLElement;
        clippedElement.style.maxHeight = `${pageHeightToUse}px`;
        clippedElement.style.overflow = 'hidden'; 

        try {
          const clippedCanvas = await html2canvas(clippedElement, html2canvasOptions);
          const clippedImgData = clippedCanvas.toDataURL('image/png');

          doc.addImage(clippedImgData, 'PNG', 0, currentY, imgWidth, pageHeightToUse);
        } catch (clippedCanvasError) {
          console.error("Error rendering clipped canvas:", clippedCanvasError); 
          // Handle the error gracefully (e.g., log, skip the current page, etc.)
        }

        currentY += pageHeightToUse;
      }

      // Restore iframe visibility
      if (iframe) {
        iframe.style.display = ''; 
      }
    });

    const newDate = new Date();
    const _date = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(newDate);
    const fileName = data?.title ? `${data?.title.substring(0, 10)}` : 'myDocument';
    const fileName2 = `${fileName}-${_date}.pdf`;
    doc.save(fileName2);

    document.body.removeChild(element);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

  function createBlockMap(text: string, blockType: string = 'unstyled'):any {
    const blocks = text.split('\n').map((line, index) => 
      new ContentBlock({
        key: `${index}`,
        text: line,
        type: blockType,
        characterList: line.split('').map(() => ({ style: [] })), 
      })
    );
  
    const contentState = ContentState.createFromBlockArray(blocks); 
   const x =contentState.getBlockMap();
    return x
  }
  type InlineStyle = { style?: string; color?: string }; // Define type for inline styles

  function createContentStateFromBlockMap(blockMap: Map<string, ContentBlock>): ContentState {
    // Convert the Map to an array of blocks
    const blocks = Array.from(blockMap.values()); 
  
    // Create a new ContentState object from the array of blocks
    const contentState = ContentState.createFromBlockArray(blocks); 
  
    return contentState;
  }

  function splitBlockWithUnstyled(contentState: ContentState, selection: SelectionState): ContentState {
    // Split the block
    let splitContentState = Modifier.splitBlock(contentState, selection);
  
    // Get the key of the newly created block
    const newBlockKey = splitContentState.getLastBlock().getKey();
  
    // Get the existing character list (including potential entities)
    const originalCharacterList = splitContentState.getBlockForKey(newBlockKey).getCharacterList();
  
    // Create a new character list with unstyled characters and existing entities
    const unstyledCharacterList = originalCharacterList.map((characterMeta:any) => {
      if (characterMeta.getEntity()) {
        // Preserve existing entity
        return CharacterMetadata.create({
          entity: characterMeta.getEntity(),
        });
      } else {
        // Create unstyled character metadata
        return CharacterMetadata.create();
      }
    });
  
    // Create a new block with unstyled characters
    const unstyledBlock:any = splitContentState.getBlockForKey(newBlockKey).set('characterList', unstyledCharacterList);
  
    // Update the block map with the unstyled block
    const updatedBlockMap = splitContentState.getBlockMap().set(newBlockKey, unstyledBlock);
  
    // Create a new ContentState with the updated block map
    splitContentState = ContentState.createFromBlockArray(
      updatedBlockMap.toArray(),
      splitContentState.getSelectionAfter()
    );
  
    return splitContentState;
  }
  
 
  const getAnnotation= (item:any)=>{
    const notSameDate = moment(item.createdAt).fromNow()!== moment(item.updatedAt).fromNow()

    if (notSameDate) {
      return `cre: ${moment(item.createdAt).fromNow()}, upd: ${moment(item.updatedAt).fromNow()}`
    }
    return  `cre: ${moment(item.createdAt).fromNow()}`
  }
  const getBoardCards = (showAnnotaion:boolean=false)=>{
    // only when its multiple.....
    if ( (dataList && dataList.length > 1) || showAnnotaion) {
      //get all content immutable object in array...
      const contentStates:any [] = dataList?.map((item) => {     
          try {
            // Handle potential empty or invalid descriptions gracefully
            if (!item.description) {
              return ContentState.createFromText(""); // Return empty ContentState
            }
         
              let contentState = convertFromRaw(JSON.parse(item.description));
              // const HIGHLIGHT_STYLE2 = 'HIGHLIGHT';
                const x:any=null;
                //const myInlineStyle = OrderedSet.of('BOLD', 'ITALIC'); 
                const myInlineStyle = OrderedSet.of('SMALL_YELLOW', 'BOLD','HIGHLIGHT', 'SMALL', 'YELLOW', 'ITALIC', 'CODE'); 
                const  colorStyle= {color:'red'}
              // // Create an entity for the highlight
              const entityKey : any = contentState.createEntity(
                HIGHLIGHT_TYPE,
                'IMMUTABLE',
                { color: 'yellow' } // Redundant here, styling handled by entity decorator
              );   
                
   
              const blockMap = contentState.getBlockMap();
              const lastBlockKey = blockMap.last().getKey();
            
              const block = blockMap.get(lastBlockKey);
              const blockText = block.getText();
              const blockLength = blockText.length;
            
              const selection = new SelectionState({
                anchorKey: lastBlockKey,
                anchorOffset: blockLength,
                focusKey: lastBlockKey,
                focusOffset: blockLength,
              });
            
              contentState = Modifier.replaceText(
                contentState,
                selection,
                ` [${getAnnotation(item)}]`,
               myInlineStyle
              );

              const blockMap2 = contentState.getBlockMap();
              const lastBlockKey2 = blockMap2.last().getKey();
            
              const block2 = blockMap2.get(lastBlockKey);
              const blockText2 = block2.getText();
              const blockLength2 = blockText2.length;
            
              const selection2 = new SelectionState({
                anchorKey: lastBlockKey2,
                anchorOffset: blockLength2,
                focusKey: lastBlockKey2,
                focusOffset: blockLength2,
              });
            

              // // Add spliblock after the replaced text
              //   const blockKey = selection.getEndKey();  
                // const contentStateWithSplitBlock = Modifier.splitBlock(
                //   contentState,
                //   selection2
                // );
              // Split the block
              const splitContentState = splitBlockWithUnstyled(contentState,selection2)
            
             
            return  splitContentState //contentStateWithSplitBlock // splitContentState

            // return convertFromRaw(JSON.parse(item.description));// getTextFromEditor2(data))
          } catch (error) {
            console.error("Error parsing JSON:", error);
            return ContentState.createFromText(""); // Return empty ContentState on error
          }
      });


      // Combine contentStates into a single ContentState
      const combinedContentState = contentStates.reduce((acc: ContentState, curr: ContentState) => {
            const currentContent = acc; 
            const currentSelection = currentContent.getSelectionAfter(); 

            const mergedContent = Modifier.replaceWithFragment(
              currentContent, 
              currentSelection, 
              curr.getBlockMap()// Correctly get an array of blocks
            ); 

            return mergedContent;
      }, ContentState.createFromText(''));

      return combinedContentState

    }
    //when dataList is empty==== this is imposible
    return getTextFromEditor2(data)
}
  useEffect(() => {
     setEditorState(EditorState.createWithContent(getBoardCards()));
  
  }, [dataList]);

  
  const { execute:executeAudit, isLoading } = useAction(createAudit, {
    onSuccess: (data) => {
      toast.success(`Update AuditLog`);
      //console.log(data)
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const { execute:executeBoardProgress } = useAction(updateBoard, {
    onSuccess: (data) => {
      //toast.success(`Board "${data.percent}" updated!`);
      // toast.success(`Board progress updated to "${data.progressStatus}%"`);
      //setPercent(data.percent);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const { execute, fieldErrors } = useAction(updateCard, {
    onSuccess: (data: { id: string; title: string; visible: boolean; }) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id]
      });
      toast.success(`Card "${data?.title}" updated`);
      // 
      setCardIDToRefreshState(data.id);
     disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit =  (formData: FormData) => {
        const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
        if (!isValidJSON(content)){
          toast.error('Note is no Valid Json')
          executeAudit({title:`${data?.title} : Note is no Valid JSON`,id:data.id})
          return
        }
        const visible = Boolean(formData.get("visible"));
        const progress = formData.get("progress") as string;
        const dueDate = new Date(String(dtVal))
        const completedDate = new Date(String(dtValCompleted))
        try {
        if (isValid(dueDate)) {
          if (isValid(completedDate)){
              execute({
                id: data.id,
                description:content,
                progress,
                visible,
                boardId,
                dueDate,                
                completedDate
              })
          }else{
              execute({
                id: data.id,
                description:content,
                progress,
                visible,
                boardId,
                dueDate 
              })
          }
        }else {
          if (isValid(completedDate)){
              execute({
                id: data.id,
                description:content,
                progress,
                visible,
                boardId,
                completedDate 
              })
          }else{
              execute({
                id: data.id,
                description:content,
                progress,
                visible,
                boardId,
              })
          }
        }
      }catch(e){
          toast.message(`${e}`)
      }
  };

  const today = new Date();
  const formattedDDate =data?.dueDate? format(data?.dueDate||today, 'EEE dd MMMM yyyy'):""; // Customize format as needed
  const daysLeft = data?.dueDate? differenceInDays(data?.dueDate, today):-1;
  const overDuestate = data?.dueDate? daysLeft>0?"left":"overdue":"NULL"
  const dayOrDays =Math.abs(daysLeft)==1? 'day': 'days'
  const finalStatement =data?.dueDate?data.progress=='complete'?"Completed" :`[${Math.abs(daysLeft)} ${dayOrDays} ${overDuestate}]`:"N/A"

  const [isChecked, setIsChecked] = useState(data?.visible||false); // Default checked
  const [progressOption, setProgressOption] = useState(data?.progress|| "not_started") // Default checked
  
  type ValuePiece = Date | null;
  type Value = ValuePiece | [ValuePiece, ValuePiece];
  const [dtVal, onChange] = useState<Value>(data?.dueDate)//new Date());
  const [dtValCompleted, onChangeCompleted] = useState<Value>(data?.completedDate)//new Date());
  
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProgressOption(event.target.value);
  };

  const onEditorStateChange = (editorState: EditorState): void => {
    setEditorState(editorState);
    const content = JSON.stringify(convertToRaw(editorState.getCurrentContent()));
    setNote(content)
  };

 
  const handleClearDate = () => {
    onChange(null);
    setCurrDate('Not Set');
  };
 
  const handleClearDate2 = () => {
    onChangeCompleted(null);
    setCurrDateCompleted('Not Set');
  };
  const [showPopup, setShowPopup] = useState(false);
  const [currDate, setCurrDate] = useState(data?.dueDate?format(data.dueDate, 'EEE dd MMMM yyyy'): "Not Set");
  
  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
  };

  
  const [showPopupCompleted, setShowPopupCompleted] = useState(false);
  const [currCompletedDate, setCurrDateCompleted] = useState(data?.completedDate?format(data.completedDate, 'EEE dd MMMM yyyy'): "Not Set");
  
  const handlePopupToggleComplete = () => {
    setShowPopupCompleted(!showPopupCompleted);
  };

  const handleDateChangeDue = (value: any, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const date = value as Date;
    const currDate= format(value, 'EEE dd MMMM yyyy')
    setCurrDate(currDate)
    onChange(date);
    setShowPopup(false)
  };
  
  
  const handleDateChangeCompleted = (value: any, event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    const date = value as Date;
    const currCompletedDate= format(value, 'EEE dd MMMM yyyy')
    setCurrDateCompleted(currCompletedDate)
    onChangeCompleted(date);
    setShowPopupCompleted(false)
  };
  const styleMap = {
    SMALL_YELLOW: {
      fontSize: '10px',
      color: 'red',
      verticalAlign: 'super', 
    },
  };
  return (
    <div className="flex items-start gap-x-3 w-full">
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
          {/* 1. First row */}
          <div className="flex flex-row justify-between">
              <p className="font-semibold text-neutral-700 mb-2">
                Description
              </p>
              <div className="flex flex-row gap-1">
                {/* First Button */}
                <Button
                  onClick={generatePdf2}
                
                  disabled={false}
                  variant="gray"
                  className="w-full justify-start"
                  size="inline"
                >
                <Search className="h-4 w-4 mr-2" />
                  Summary
                </Button>
                
                <Button
                  onClick={handleDownloadPdf}
                  disabled={false}
                  variant="gray"
                  className="w-full justify-start"
                  size="inline"
                >
                <TbPdf className="h-4 w-4 mr-2" />
                  pdf1
                </Button>
                {/* Second Button */}
                <Button
                  onClick={generatePdf}
                  disabled={false}
                  variant="gray"
                  className="w-full justify-start"
                  size="inline"
                >
                <Download className="h-4 w-4 mr-2" />
                  pdf2
                </Button>
              </div>
          </div>
        {/*2. Row Alternative Editing and display */}
        {isEditing ? (
          <form
            id="id1"
            name= "name1"
            action={onSubmit}
            ref={formRef}
            className="mt-1 flex flex-col space-y-2 min-h-[70vh]"
          >
           <div  className="flex flex-col gap-y-1">
              <div className="min-h-[40vh]   overflow-x-hidden     overflow-y-auto ">
                <Editor
                  editorStyle={{ minHeight: '40vh', 
                                 maxWidth:"90vw", 
                                 //maxHeight: '50vh', 
                                 border: "1px solid #ccc",  
                                 borderRadius: '7px',
                                 padding:'11px',
                                }}
                  editorState={editorState}
                  onEditorStateChange={onEditorStateChange}
                  wrapperClassName="wrapper-class"
                  editorClassName="editor-class"
                  toolbarClassName="toolbar-class"
                  toolbarStyle={{border: '1px solid #ccc', borderRadius: '7px'}}
                  wrapperStyle={{ padding: '.2rem', border: '1px solid #ccc',  borderRadius: '7px' } }
                  customStyleMap={styleMap} // Add customStyleMap prop here
                />
              </div>
              <div className="flex md:flex-row flex-col justify-between space-y-1">
                  <div className="space-x-2">
                    <input 
                        id="visible" 
                        name="visible"
                        type="checkbox" 
                        ref={checkboxRef} 
                        checked={isChecked}
                        onChange={handleCheckboxChange} />
                    <label htmlFor="checkbox">Information is public</label>
                  </div>
              
                  <div className="flex flex-row space-x-1">
                    <label htmlFor="progress" className="italic">Progress:</label>
                    <select id="progress" name="progress" value={progressOption} onChange={handleSelectChange}>
                        {/* Dynamically populate options based on your data model */}
                        <option value="not_started">Not Started</option>
                        <option value="wip">WIP</option>
                        <option value="stabbled">Stabbled</option>
                        <option value="complete">Complete</option>
                        {/* ...other options */}
                    </select>
                  </div>
              </div>
            </div>
           
            <Separator />
            <div className="flex flex-col space-x-1">
                <div className="flex md:flex-row flex-col justify-between">
                  
                  <div 
                    role='button' 
                    onClick={handlePopupToggle}
                    className={cn(
                      `hover:text-sm`,                   
                      showPopup?"text-blue-500":"text-red-400"
                    )}
                  >
                      {showPopup?"Close Calender": isValid((new Date(String(dtVal))))?"Change Due-Date":"Set Due-Date"}
                  </div>
                  <span>{currDate}</span>
                  <div 
                    role='button'
                    className={cn(
                      `text-muted-foreground hover:text-sm`,                   
                      isValid((new Date(String(dtVal))))?"text-red-500":"text-gray-400"
                    )}
                      onClick={handleClearDate}                   
                   >
                    Clear Due-Date
                  </div>
                </div>
               
               <div className="calendar-container max-w-[90vw]">
                  {showPopup && ( <Calendar  onChange={handleDateChangeDue} className="max-w-[80vw]" showWeekNumbers value={dtVal} /> )}
                  
              </div>
            </div>
            <Separator/>
            <div className="flex flex-col space-x-1">
                <div className="flex md:flex-row flex-col justify-between">
                  
                  <div 
                    role='button' 
                    onClick={handlePopupToggleComplete}
                    className={cn(
                      `hover:text-sm`,                   
                      showPopupCompleted?"text-blue-500":"text-red-400"
                    )}
                  >
                      {showPopupCompleted?"Close Calender": isValid((new Date(String(dtValCompleted))))?"Change Date Completed":"Set Date Completed"}
                  </div>
                  <span>{currCompletedDate}</span>
                  <div 
                    role='button'
                    className={cn(
                      `text-muted-foreground hover:text-sm`,                   
                      isValid((new Date(String(dtValCompleted))))?"text-red-500":"text-gray-400"
                    )}
                      onClick={handleClearDate2}                   
                   >
                    Clear Date Completed
                  </div>
                </div>
               
               <div className="calendar-container max-w-[90vw]">
                  {showPopupCompleted && ( <Calendar  onChange={handleDateChangeCompleted} className="max-w-[80vw]" showWeekNumbers value={dtValCompleted} /> )}
                  
              </div>
            </div>
            <Separator/>
          
            <div className={cn("flex items-center gap-x-2")}>
              <FormSubmit className={cn(dataList.length>1?'hidden':'')}>
                Save
              </FormSubmit>
              <Button
                type="button"
                onClick={disableEditing}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
             

       </div>
          </form>
        ) : (
          <div className="bg-slate-100 rounded-sm px-2 mt-1">
              <div 
                 className="p-2 static-editor min-h-[40vh] overflow-x-hidden overflow-y-auto  border rounded-lg"
                 onClick={enableEditing} 
              >
                    <Editor2 
                     customStyleMap ={{
                      editor: {
                        border: '1px solid #ccc',
                        padding: '11px', // Concatenate with unit
                        borderRadius:'5px',
                        minHeight: '40vh',
                        backgroundColor:'#ddd',
                        margin:"5px"
                      },
                      toolbar:{
                        border: '1px solid #ccc', 
                        borderRadius: '7px'
                      },
                      wrapper: { 
                        //padding: '1rem', 
                        border: '1px solid #ccc',  
                        borderRadius: '7px' 
                      },
                      SMALL_YELLOW: {
                        fontSize: '8px',
                        color: 'red',
                        verticalAlign: 'super', 
                        // backgroundColor:'red',
                        
                      },
                      
                    }}
                   
                      editorState={EditorState.createWithContent(getBoardCards(true))} 
                      readOnly 
                      onChange={() => {}} // Empty dummy function
                      
                    />
              </div>
              <div className="flex md:flex-row flex-col justify-between">
                  <div className="space-x-2">
                      <input 
                          id="visible" 
                          name="visible"
                          type="checkbox" 
                          ref={checkboxRef} 
                          checked={isChecked}
                          disabled={true} />
                      <label htmlFor="checkbox">Information is public</label>
                  </div>
                  <div className="flex flex-row space-x-2">
                    <label htmlFor="progress" className="italic">Progress:</label>
                    <span className="text-rose-500">{values[data?.progress as keyof typeof values]}</span>
                  </div>
              </div>
              <div className="flex md:flex-row flex-col justify-between">
                <div className="space-x-2 md:flex-row ">           
                  <label htmlFor="progress">Due Date:</label>
                  <span className="text-rose-500">{formattedDDate} </span> 
                </div>
                <span className="text-gray-400 italic">{finalStatement}</span>
              </div>
              <div  
                  onClick={enableEditing} 
                  role="button"
                  className={cn("mt-2 text-sm",
                                isChecked?  "text-rose-500": "text-black/90")
                              }>
                  {isChecked? "Information is public and anyone may access it. To edit Click anywhere within this block":"Information is private and available only to you. To edit Click anywhere within this block"}
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-[98px] bg-neutral-200" />
      </div>
    </div>
  );
};


export function getTextFromEditor( data: Card ) {
  //console.log('data', data)
  if (data?.description !==undefined && data?.description !==null && data.description!=="") {
       //console.log('data', data)
      if (isJsonStringEditorCompatible(data?.description||"")){
          //console.log('NotePage:::', data.description)
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));
             return(JSON.stringify(DBEditorState.getPlainText()))
          }catch(e){
            // console.log("ERROR A:", e)
            const { contentBlocks, entityMap } = convertFromHTML('');
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(JSON.stringify(contentState.getPlainText())) 
           
          }
         
          
      }else{
            //const processedHTML = DraftPasteProcessor.processHTML(data.description);
            const { contentBlocks, entityMap } = convertFromHTML(data.description);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            //const contentState = ContentState.createFromBlockArray(processedHTML);  
            return(JSON.stringify(contentState.getPlainText())) 
      }

  }else {
      const placeholder= ''
      //const processedHTML = DraftPasteProcessor.processHTML(data.description);
      const { contentBlocks, entityMap } = convertFromHTML(placeholder);
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      //const contentState = ContentState.createFromBlockArray(processedHTML);     
      return(JSON.stringify(contentState.getPlainText()))
  }

}
export function removeTags(input:string, newlineReplacement = ' ') {
  const plainText = input.replace(/\n/g, newlineReplacement);
  // console.log('bbbb', plainText)
  return plainText.trim(); // Remove leading/trailing whitespace
}
export function getTextFromEditorSafe( data: SafeCard ) {
  //console.log('data', data)
  if (data?.description !==undefined && data?.description !==null && data?.description!=="") {
       //console.log('data', data)
      if (isJsonStringEditorCompatible(data?.description||"")){
          //console.log('NotePage:::', data.description)
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));
             return(removeTags(JSON.stringify(DBEditorState.getPlainText())))
          }catch(e){
                // toast.error(`Trying to recover you data.${e}`)
                const placeholder= ''
                // console.log('Data with errors:', data?.description)
                const { contentBlocks, entityMap } = convertFromHTML(placeholder);
                const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                return(removeTags(JSON.stringify(contentState.getPlainText()))) 
             

          }
         
          
      }else{
            const { contentBlocks, entityMap } = convertFromHTML(data.description);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(removeTags(JSON.stringify(contentState.getPlainText()))) 
      }

  }else {
      const placeholder= ''
      const { contentBlocks, entityMap } = convertFromHTML(placeholder);
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return(JSON.stringify(contentState.getPlainText()))
  }

}
export function getTextFromEditorSafe2( data: CardWithList2 ) {
  //console.log('data', data)
  if (data?.description !==undefined && data?.description !==null && data?.description!=="") {
       //console.log('data', data)
      if (isJsonStringEditorCompatible(data?.description||"")){
          //console.log('NotePage:::', data.description)
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));
             return(removeTags(JSON.stringify(DBEditorState.getPlainText())))
          }catch(e){
                // toast.error(`Trying to recover you data.${e}`)
                const placeholder= ''
                // console.log('Data with errors:', data?.description)
                const { contentBlocks, entityMap } = convertFromHTML(placeholder);
                const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
                return(removeTags(JSON.stringify(contentState.getPlainText()))) 
              

          }
         
          
      }else{
            const { contentBlocks, entityMap } = convertFromHTML(data.description);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(removeTags(JSON.stringify(contentState.getPlainText()))) 
      }

  }else {
      const placeholder= ''
      const { contentBlocks, entityMap } = convertFromHTML(placeholder);
      const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return(JSON.stringify(contentState.getPlainText()))
  }

}
export function getTextFromEditor2( data: Card ) {
  if (data?.description !==undefined && data?.description !==null) {
      if (isJsonStringEditorCompatible(data?.description||"")){
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));   
            // JSON.stringify(DBEditorState.getPlainText())       
             return (DBEditorState)
          }catch(e){
            //toast.error(`Last resort failure.${e}`)
            const placeholder= ''
            // console.log('Data with errors:', data?.description)
            const { contentBlocks, entityMap } = convertFromHTML(placeholder);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);   
            return (contentState) 
          
           
          }
         

      }else{
          const { contentBlocks, entityMap } = convertFromHTML(data?.description);
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(contentState) 
      }

  }else {
      const placeholder= ''
       const { contentBlocks, entityMap } = convertFromHTML(placeholder);
       const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return (contentState) 
  }

}
export function getTextFromEditor3( data: SafeCardWithList2 ) {
  if (data?.description !==undefined && data?.description !==null) {
      if (isJsonStringEditorCompatible(data?.description||"")){
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));   
            // JSON.stringify(DBEditorState.getPlainText())       
             return (DBEditorState)
          }catch(e){
            //toast.error(`Last resort failure.${e}`)
            const placeholder= ''
            // console.log('Data with errors:', data?.description)
            const { contentBlocks, entityMap } = convertFromHTML(placeholder);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);   
            return (contentState) 
          
           
          }
         

      }else{
          const { contentBlocks, entityMap } = convertFromHTML(data?.description);
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(contentState) 
      }

  }else {
      const placeholder= ''
       const { contentBlocks, entityMap } = convertFromHTML(placeholder);
       const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return (contentState) 
  }

}
export function getTextFromEditor3_2( data: SafeCard ) {
  if (data?.description !==undefined && data?.description !==null) {
      if (isJsonStringEditorCompatible(data?.description||"")){
          try{
             const DBEditorState = convertFromRaw(JSON.parse(data?.description||""));   
            // JSON.stringify(DBEditorState.getPlainText())       
             return (DBEditorState)
          }catch(e){
            //toast.error(`Last resort failure.${e}`)
            const placeholder= ''
            // console.log('Data with errors:', data?.description)
            const { contentBlocks, entityMap } = convertFromHTML(placeholder);
            const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);   
            return (contentState) 
          
           
          }
         

      }else{
          const { contentBlocks, entityMap } = convertFromHTML(data?.description);
          const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
            return(contentState) 
      }

  }else {
      const placeholder= ''
       const { contentBlocks, entityMap } = convertFromHTML(placeholder);
       const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
      return (contentState) 
  }

}
export function getAllTextEntries(editorState: { getCurrentContent: () => any; }) {
  const content = editorState.getCurrentContent();
  const blockMap = content.getBlockMap();

  const textEntries: any[] = [];

  blockMap.forEach((block: { getText: () => any; }) => {
    const text = block.getText();
    textEntries.push(text);
  });

  return textEntries;
}

interface Data {
  text: string;
  // Add other properties as needed
}
interface UserData {
  blocks: Data[];
  // Add other properties as needed
}
export function getAllTextEntriesA(json_string: string) {

  let c : string []=[]// string array initialised empty
 
  //const data = json.loads(json_string)
  const userData = JSON.parse(json_string);
  //toast.error(`"----->${ userData}`)
  userData.forEach((el: { text: string; }, index: any)=> {
    // Code to be executed for each element
   // console.log("pushing", el.text)
    c.push(el.text)
   
  });
  const joinedString = c.join("\n");
  return joinedString
}
export function isValidJSON(str:string) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

/* 

Certainly, let's break down this code snippet:

**Purpose:**

This code snippet aims to combine multiple `ContentState` objects into a single `ContentState` object. This is likely used in a scenario where you have a collection of content states (e.g., from different sources or parts of a larger document) and want to merge them into a unified representation.

**Key Concepts:**

- **`reduce()`:** This is a higher-order function in JavaScript that iterates over an array and accumulates a single value. 
- **`ContentState`:** This is a core data structure in the Draft.js library. It represents the immutable content of an editor, including text, formatting, and entities.
- **`Modifier`:** This is a utility class in Draft.js that provides functions for modifying `ContentState`.

**Code Explanation:**

1. **Initialization:**
   - `ContentState.createFromText('')` creates an initial empty `ContentState` object. This serves as the starting point for the accumulation process.

2. **Iteration:**
   - The `reduce()` method iterates over the `contentStates` array.
   - In each iteration:
     - `acc` represents the accumulated `ContentState` so far.
     - `curr` represents the current `ContentState` being processed.

3. **Merging Content:**
   - `const currentContent = acc;`: This line simply assigns the current accumulated `ContentState` to a variable for better readability.
   - `const currentSelection = currentContent.getSelectionAfter();`: This line obtains the selection after the current content. This is important because the `replaceWithFragment` method needs to know where to insert the new content.
   - `const mergedContent = Modifier.replaceWithFragment(...)`: 
      - This is the core of the merging logic. 
      - `currentContent`: The existing content state.
      - `currentSelection`: The position within the existing content where the new content should be inserted.
      - `curr.getBlockMap()`: This extracts the block map from the current `ContentState`. The block map is an ordered map of blocks that represent the structure of the content.
      - `Modifier.replaceWithFragment()` merges the blocks from the current `ContentState` (`curr`) into the existing content (`currentContent`) at the specified `currentSelection`.

4. **Returning the Accumulated State:**
   - `return mergedContent;`: The `reduce()` method returns the `mergedContent` in each iteration. This becomes the `acc` value for the next iteration, effectively accumulating the combined `ContentState`.

**In Summary:**

This code effectively combines multiple `ContentState` objects by iteratively merging their block maps into a single `ContentState`. This is a common operation when working with content in Draft.js, such as when concatenating content from different sources or building complex content structures.

**Note:**

- This explanation assumes that the `contentStates` array contains valid `ContentState` objects.
- The actual behavior and the correctness of this code depend on the specific implementation of `Modifier.replaceWithFragment` and how it handles merging blocks within the `ContentState` structure.

I hope this comprehensive explanation is helpful!



*/