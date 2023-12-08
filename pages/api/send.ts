import type { NextApiRequest, NextApiResponse } from "next";

import { EmailClient, EmailSendResponse } from "@azure/communication-email";
import { compare } from "bcrypt";
import validator from "validator";

type Data = {
  error?: string;
  ok: boolean;
  response?: any;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { email, source, question } = req.body;

  const questionHash = process.env.QUESTION_HASH;
  const prodConnectionString = process.env.PROD_EMAIL_CONNECTION_STRING;
  const testConnectionString = process.env.TEST_EMAIL_CONNECTION_STRING;
  const testNoaConnectionString = process.env.TESTNOA_EMAIL_CONNECTION_STRING;
  const testAConnectionString = process.env.TESTA_EMAIL_CONNECTION_STRING;

  if (!questionHash) {
    res
      .status(500)
      .json({ ok: false, error: "No question hash in environment" });
    return;
  }

  if (!prodConnectionString) {
    res
      .status(500)
      .json({ ok: false, error: "No prod connection string in environment" });
    return;
  }

  if (!testConnectionString) {
    res
      .status(500)
      .json({ ok: false, error: "No test connection string in environment" });
    return;
  }

  if (!testNoaConnectionString) {
    res.status(500).json({
      ok: false,
      error: "No test noa connection string in environment",
    });
    return;
  }

  if (!testAConnectionString) {
    res.status(500).json({
      ok: false,
      error: "No test A connection string in environment",
    });
    return;
  }

  if (!validator.isEmail(email)) {
    res.status(400).json({ ok: false, error: "Not a valid email" });
    return;
  }

  if (!(await compare(question.toLowerCase().trim(), questionHash))) {
    res.status(403).json({ ok: false, error: "Invalid question answer" });
    return;
  }

  const client = new EmailClient(
    source.includes("codespring.ro")
      ? prodConnectionString
      : source.includes("noarecord")
      ? testNoaConnectionString
      : source.includes("arecord")
      ? testAConnectionString
      : testConnectionString
  );
  const message = {
    senderAddress: source,
    content: {
      subject: "Testing subject",
      plainText: "Testing body",
    },
    recipients: {
      to: [
        {
          address: email,
        },
      ],
    },
  };

  try {
    const poller = await client.beginSend(message);
    const response = await poller.pollUntilDone();

    res.status(200).json({
      ok: true,
      response,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      response: error,
    });
  }
}
