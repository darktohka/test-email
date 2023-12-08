import { Inter } from "next/font/google";
import { useState } from "react";
import { EmailSendResponse } from "@azure/communication-email";

const inter = Inter({ subsets: ["latin"] });

const defaultEmail = "derzsi.daniel@codespring.ro";
const defaultSource = "timetable@azoramail.codespring.ro";

export interface SendEmailResponseDTO {
  error?: string;
  ok: boolean;
  response?: EmailSendResponse;
}

export const EmailForm = () => {
  const [emailAddress, setEmailAddress] = useState<string>(defaultEmail);
  const [sourceAddress, setSourceAddress] = useState<string>(defaultSource);
  const [fullName, setFullName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<string>("");

  const handleSendEmail = async () => {
    setLoading(true);
    setResponse("Sending...");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        body: JSON.stringify({
          email: emailAddress,
          source: sourceAddress,
          question: fullName,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await res.json();

      if (response.error) {
        setResponse(response.error);
      } else if (response.response) {
        setResponse(JSON.stringify(response.response, null, 2));
      } else {
        setResponse("All OK! Sent.");
      }
    } catch (error: any) {
      setResponse(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center w-[100%]">
      <div className="flex flex-col">
        <pre className="mb-5">{response}</pre>
      </div>
      <div className="flex flex-col">
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 text-white"
          >
            Sender address
          </label>
          <select
            className="w-[16rem] border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            placeholder="derzsi.daniel@codespring.ro"
            value={sourceAddress}
            onChange={(e) => setSourceAddress(e.target.value)}
            required
          >
            <option>timetable@azoramail.codespring.ro</option>
            <option>DoNotReply@azoramail.codespring.ro</option>
            <option>DoNotReply@testemail.tohka.us</option>
            <option>DoNotReply@noarecord.tohka.us</option>
            <option>DoNotReply@arecord.tohka.us</option>
          </select>
        </div>
        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900 text-white"
          >
            Target address
          </label>
          <input
            type="email"
            id="email"
            className="w-[16rem] border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            placeholder="derzsi.daniel@codespring.ro"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="question"
            className="block mb-2 text-sm font-medium text-white"
          >
            Who is the CEO? (first name only)
          </label>
          <input
            type="question"
            id="question"
            className="w-[16rem] border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <button
          className={`${
            loading
              ? "hover:cursor-not-allowed bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          } text-white focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center`}
          onClick={handleSendEmail}
        >
          Send test e-mail
        </button>
      </div>
    </div>
  );
};
export default function Home() {
  return (
    <main
      className={`bg-black-100 flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <EmailForm />
      </div>
    </main>
  );
}
