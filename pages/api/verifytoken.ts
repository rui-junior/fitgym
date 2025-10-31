// src/pages/api/verifytoken.ts
// import type { NextApiRequest, NextApiResponse } from "next";
// import { firebaseAdmin } from "../../firebase/firebaseAdmin";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== "POST") {
//     return res.status(405).json({ error: "Método não permitido" });
//   }

//   const { token } = req.body;

//   try {
//     const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
//     return res.status(200).json({
//       id: decodedToken.uid,
//       role: decodedToken.role || "user", // se não tiver role, assume user
//     });
//   } catch (error) {
//     console.error(error);
//     return res.status(401).json({ error: true, message: "Token inválido" });
//   }
// }




// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { firebaseAdmin } from '../../firebase/firebaseAdmin'
import { getAuth, Auth } from 'firebase-admin/auth'


export default function (req: NextApiRequest, res: NextApiResponse) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
    }

    const { token } = req.body

    getAuth().verifyIdToken(token)
    .then((decodedToken) => {

        res.json({ 'id': decodedToken.uid })

    })

    .catch((error) => {

        res.json({ 'error': true })
        console.log(error)

    })


}