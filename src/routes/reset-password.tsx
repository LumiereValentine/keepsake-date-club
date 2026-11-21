import {createFileRoute} from '@tanstack/react-router';
import {Login} from '@/features/anniversary/Login';
import {pageHead} from '@/features/anniversary/content';
export const Route=createFileRoute('/reset-password')({head:()=>pageHead('Reset your password','Securely recover access to our private anniversary space.'),component:()=> <Login recovery/>});
