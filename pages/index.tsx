
import { destroyCookie, setCookie } from "nookies";
import { firebaseAdmin } from "../firebase/firebaseAdmin";

import Login from "./login/index"


export default function Home() {


  return (
    <>
      <Login />
    </>
  );
}


export async function getServerSideProps(context: any) {
  
  const token = context.req.cookies?.token;

  try {

    if (!token) {
      destroyCookie(context, "token", { path: "/" });
      return { props: {} };
    }

    // Tenta verificar o token
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

    return {
      redirect: {
        destination: "/dashboard",
        permanent: false,
      },
    };

  } catch (error: any) {

    destroyCookie(context, "token", { path: "/" });

    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // Pass data to the page via props
}
