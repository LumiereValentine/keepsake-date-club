import {queryOptions} from '@tanstack/react-query';
import {getMembership,listMedia} from './data.functions';
export const membershipQuery = queryOptions({queryKey:['membership'],queryFn:()=>getMembership()});
export const mediaQuery = queryOptions({queryKey:['media'],queryFn:()=>listMedia(),staleTime:5*60*1000});
