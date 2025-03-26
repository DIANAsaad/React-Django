import React from "react";




const NotAuthorized: React.FC = () =>{
    return(
        <>
        <h1>
            You are not authorized to view this page.
        </h1>
      <h2 style={{ color: "red", fontWeight: "bold", fontSize: "1.5rem" }}>
        ⚠️ ALERT: If you believe this is an error, please contact support immediately!⚠️
      </h2>

    </>
  );
};


export default NotAuthorized;