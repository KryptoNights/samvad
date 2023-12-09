import React from "react";
import Layout from "../../components/layout/layout";

import GlobalLayout from "../../components/Global/Global";

export default function Home(props:any) {



  return (
    <>
      <div>
        <GlobalLayout props={props}>
          <Layout props={props}/>
        </GlobalLayout>
      </div>
    </>
  );
}
