import react , {useCallback, useState, createContext} from 'react';
import axios from 'axios';
import { useAuth } from "./AuthContext";


// Define the shape of the comment.
interface Comment {
    id:number;
    lesson_id:number;
    commentor:{
        first_name:string;
        last_name:string;
    }
    comment:string;
    commented:Date;
    images:{
        image:File|null;
    }
}

//Define the context structure

interface CommentContextProps{
    comments:Comment[]|null;
    fetchComments:(lessonId:number)=>Promise<void>;
    addComment: (data:{
        lesson_id:number;
        comment:string;
        images:File[];
    })=>Promise<void>;
    deleteComment:(commentId:number)=>Promise<void>;
    loading:boolean;
    error:string|null;
}


const CommentContext=createContext<CommentContextProps|undefined>(undefined);