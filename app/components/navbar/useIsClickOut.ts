// app/components/navbar/useIsClickOut.ts
'use client';

import { useEffect, useState, useCallback } from "react";
import { SafeUser } from "@/app/types";

export const useIsClickOut = (setter: (bool: boolean) => void, currentUser: SafeUser | null | undefined): [(node: any) => void] => {
    const [ele, setEle] = useState<HTMLDivElement | null>(null);
    const eleCallback = useCallback((node: HTMLDivElement) => {
        setEle(node);
    }, []);

    useEffect(() => {
        if (!currentUser || ele === null) { // undefined will also be caught here
            return;
        }

        const handleClick = (e: any) => {
            if (ele.contains(e.target)) return;
            setter(false);
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [ele, setter, currentUser]);

    return [eleCallback];
};

export default useIsClickOut;

// // app/components/navbar/useIsClickOut.ts
// 'use client';

// import { useEffect, useState, useCallback } from "react";
// import { SafeUser } from "@/app/types"; // Assuming SafeUser type is defined here

// export const useIsClickOut = (setter: (bool: boolean) => void, currentUser: SafeUser | null): [(node: any) => void] => {
//     const [ele, setEle] = useState<HTMLDivElement | null>(null);
//     const eleCallback = useCallback((node: HTMLDivElement) => {
//         setEle(node);
//     }, []);

//     useEffect(() => {
//         if (!currentUser || ele === null) {
//             return; // Don't attach listener if no user or element
//         }

//         const handleClick = (e: any) => {
//             if (ele.contains(e.target)) return;
//             setter(false);
//         };

//         document.addEventListener("mousedown", handleClick);
//         return () => document.removeEventListener("mousedown", handleClick);
//     }, [ele, setter, currentUser]); // Include currentUser in dependencies

//     return [eleCallback];
// };

// export default useIsClickOut;
// 'use client';

// import { useEffect, useState, useCallback } from "react";

// export const useIsClickOut = (setter: (bool: boolean) => void): [(node: any) => void] => {
//     const [ele, setEle] = useState<HTMLDivElement | null>(null)
//     const eleCallback = useCallback((node: HTMLDivElement) => {
//         setEle(node);
//     }, []);

//     useEffect(() => {
//         if (ele) { // Conditional logic inside the effect
//             const handleClick = (e: any) => {
//                 if (!ele.contains(e.target)) {
//                     setter(false);
//                 }
//             };

//             document.addEventListener("mousedown", handleClick);
//             return () => document.removeEventListener("mousedown", handleClick);
//         }

//         // Return a cleanup function even if ele is null
//         return () => {};
//     }, [ele, setter]); // Include setter in the dependency array

//     return [eleCallback];
// };

// export default useIsClickOut;


// Ah, the dreaded "Rendered more hooks than during the previous render" error in React! It's a common pitfall when working with conditional logic and hooks. Let's break down why this is happening in your useIsClickOut custom hook and how to fix it.

// The core rule of React Hooks is that you must call them in the exact same order on every render of a component. Conditional logic around hook calls violates this rule.


// 'use client';

// import { useEffect, useState, useCallback } from "react";

// export const useIsClickOut = (setter: (bool: boolean) => void): [(node: any) => void] => {
//     const [ele, setEle] = useState<HTMLDivElement | null>(null)
//     const eleCallback = useCallback((node: HTMLDivElement) => { 
// setEle(node) }, [])

// useEffect(() => {
//     if (ele === null) return;

//     const handleClick = (e: any) => {
//         if (ele.contains(e.target)) return;
//         setter(false)
//     }

//     document.addEventListener("mousedown", handleClick);
//     return () => document.removeEventListener("mousedown", handleClick);
// }, [ele]);

//  return [eleCallback]
// };

//export default useIsClickOut;