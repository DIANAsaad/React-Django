import React , {useEffect, useMemo} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {useQuizContext} from "../../../../context/QuizContext";




const QuizPage: React.FC= () =>{

const {quizId}= useParams<{quizId:string}>();
const {quizzes,questions,fetchQuizById}=useQuizContext();


useEffect(()=>{
      if(quizId){
        fetchQuizById(Number(quizId))
      }
},[quizId,fetchQuizById])

const quiz = useMemo(() => {
    return quizzes?.find((q) => q.id === parseInt(quizId!, 10));
  }, [quizzes, quizId]);
 

if(!quizzes){
    return <div>Quiz not found</div>
}

return (<p>
    Hi
</p>)

};
export default QuizPage;











