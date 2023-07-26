import jwt from "jsonwebtoken";
import { check, redirect } from "src/auth";
const secret = process.env.NEXTAUTH_SECRET;

export default async function handler(req, res) {
  const user = await check(req, res);
  if (!user) {
    return redirect(res);
  }
  // Note: getToken from next auth returns null
  // using the underlining package directly
  const result = jwt.sign({ id: user.id }, secret);
  res.status(200).json({ result: result });
}
