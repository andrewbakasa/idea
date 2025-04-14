'use client';

import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { signIn } from 'next-auth/react';
import { 
  FieldValues, 
  SubmitHandler, 
  useForm
} from "react-hook-form";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub } from "react-icons/ai";
import { usePathname, useRouter } from "next/navigation";

import useRegisterModal from "../../../app/hooks/useRegisterModal";
import useLoginModal from "../../../app/hooks/useLoginModal";

import Modal from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Heading";
import Button from "../Button";
import { EyeIcon, EyeOffIcon} from "lucide-react";

const LoginModal = () => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const handleToggleVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  const [googleLabel, setGoogleLabel] = useState('Continue with Google');
  const [githubLabel, setGithubLabel] = useState('Continue with Github');

  const pathname = usePathname();
  const isDeniedPage = pathname === '/denied';

  //const currentPath = router.;

  const { 
    register, 
    handleSubmit,
    formState: {
      errors,
    },
  } = useForm<FieldValues>({
    defaultValues: {
      email: '',
      password: ''
    },
  });

  const handleSignIn = async (provider:string) => {
    setIsLoading(true); // Disable button
    try {
        // Replace with your actual Google Sign In logic
        if (provider =="google"){
          setGoogleLabel('Authenticating...')
        }
        if (provider =="github"){
          setGithubLabel('Authenticating...')
        }
       const result= await signIn(provider, { redirect: false })
       console.log("Authentication error:", result)
       if (!result?.error) {
          // User successfully signed in, redirect to a specific page
          // setIsLoading(false);
          //router.push('/');
        } else {
          // setIsLoading(false);
          // router.push('/');
        }
    
    } catch (error) {
        // Handle error gracefully
    } finally {
      //wait some 15s before enabing
        setTimeout(() => {
          setIsLoading(false); // Enable button
        },15000);
        if (provider =="google"){
          setGoogleLabel('Finalizing...')
        }
        if (provider =="github"){
          setGithubLabel('Finalizing...')
        }
        router.push("/")   
    }
};

  const onSubmit: SubmitHandler<FieldValues> = 
  (data) => {
    setIsLoading(true);

    signIn('credentials', { 
      ...data, 
      redirect: false,
    })
    .then((callback) => {
      setIsLoading(false);

      if (callback?.ok) {
       // console.log('...',callback)
        toast.success('Logged in');
        //ONLY WHEN ON DENIED gO TO HOME PAGE
        if (isDeniedPage) {
          router.push("/")
        }
        router.refresh();
        loginModal.onClose();
      }
      
      if (callback?.error) {
        toast.error(callback.error);
      }
    });
  }

  
  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal])

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <Heading
        title="Welcome back"
        subtitle="Login to your account!"
      />
      <Input
        id="email"
        label="Email"
        disabled={isLoading}
        register={register}  
        errors={errors}
        required
      />
      <div className="flex items-center mb-4">
          <Input
            id="password"
            label="Password"
            type={isPasswordVisible ? 'text' : 'password'}
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <button
              type="button"
              onClick={handleToggleVisibility}
              className="absolute  right-[36px] focus:outline-none"
            >
              {isPasswordVisible ? <EyeOffIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
            </button>
      </div>
    
    </div>
  )


  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <Button 
        outline 
        label={googleLabel}
        disabled={isLoading}
        icon={FcGoogle}
        onClick={() => handleSignIn('google')}
      />
     
      <Button 
        outline 
        label={githubLabel} 
        disabled={isLoading}
        icon={AiFillGithub}
        onClick={() => handleSignIn('github')}
        />
      <div className="
      text-neutral-500 text-center mt-4 font-light">
        <p>First time using Vertex?
          <span 
            onClick={onToggle} 
            className="
              text-neutral-800
              cursor-pointer 
              hover:underline
            "
            > Create an account</span>
        </p>
      </div>
    </div>
  )

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title="Login"
      actionLabel="Continue"
      onClose={loginModal.onClose}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
      footer={footerContent}
    />
  );
}

export default LoginModal;
