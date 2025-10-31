import type { NextApiRequest, NextApiResponse } from "next";
import { firebaseAdmin } from "../../firebase/firebaseAdmin";

type Data = {
    message?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    // 1. Proteger a Rota: Apenas requisições POST são permitidas
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Verificar se quem chama é um admin (MUITO IMPORTANTE)
        // const { authorization } = req.headers;
        // if (!authorization || !authorization.startsWith('Bearer ')) {
        //     return res.status(401).json({ error: 'Unauthorized: No token provided.' });
        // }
        // const token = authorization.split('Bearer ')[1];
        // const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);

        // // Se o claim 'admin' não for verdadeiro no token de quem está chamando, bloqueie.
        // if (decodedToken.admin !== true) {
        //     return res.status(403).json({ error: 'Forbidden: You do not have admin privileges.' });
        // }

        // 3. Pegar o UID do usuário que será tornado admin
        const { uid } = req.body;
        if (!uid) {
            return res.status(400).json({ error: 'Bad Request: UID is required.' });
        }

        // 4. Definir o Custom Claim
        await firebaseAdmin.auth().setCustomUserClaims(uid, { admin: true });

        // 5. Retornar sucesso
        res.status(200).json({ message: `Success! User ${uid} is now an admin.` });

    } catch (error: any) {
        console.error("Error in setAdminRole:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}



/*
Para setar o primeiro admin manualmente:
Atravez do postman, POST, chama esta pagina com o Try comentado até "const {uid} = req.body"
*/