import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Response } from "express";
import { Observable } from "rxjs";
import { map } from "rxjs/operators"
export interface ApiResponse<T>{
    statusCode:number;
    message: string;
    data: T
}
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>>{
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiResponse<T>> {
        return next.handle().pipe(
            map((data: T | {message:string; [key:string]:unknown}) => {
                const statusCode = context.switchToHttp().getResponse<Response>().statusCode;
                if(typeof data === 'object' && data !== null && 'message' in data){
                    const {message, ...rest} = data;
                    return{
                        statusCode,
                        message,
                        data: (Object.keys(rest).length === 0 ? null: rest) as T,
                    }
                }
                return {statusCode, message:'Success', data}
            }),
        )
    }
}