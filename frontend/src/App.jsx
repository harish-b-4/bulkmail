import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function App() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState(false);
  const [emailList, setEmailList] = useState([]);
  const [fileInputKey, setFileInputKey] = useState(Date.now()); // For resetting file input

  // Handle message textarea
  function handleMsg(evt) {
    setMsg(evt.target.value);
  }

  // Handle file input and read Excel
  function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: "A" });
      const emails = excelData.map((item) => item.A).filter(Boolean);
      setEmailList(emails);
    };
    reader.readAsBinaryString(file);
  }

  // Send email
  async function send() {
    if (!msg || emailList.length === 0) {
      alert("Enter message and select a file with emails.");
      return;
    }

    setStatus(true);

    try {
      const response = await axios.post(
        "https://bulkmailbackend-mgva.onrender.com/sendmail",
        { msg, emailList }
      );

      if (response.data.success === true) {
        alert("Emails sent successfully!");
        setMsg("");
        setEmailList([]);
        setFileInputKey(Date.now()); // Reset file input
      } else {
        alert("Failed to send emails");
      }
    } catch (error) {
      console.error(error);
      alert("Server error. Check console for details.");
    }

    setStatus(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-500 via-teal-400 to-white flex items-center justify-center px-4">
      <div className="bg-white/90 w-full max-w-2xl rounded-2xl shadow-2xl p-6 sm:p-8">
        {/* Header */}
        <h1 className="text-3xl lg:text-5xl font-bold text-center text-blue-900">
          Bulk Mail Sender
        </h1>

        {/* Message Box */}
        <div className="mt-6">
          <label className="block text-sm lg:text-xl font-medium text-gray-700 mb-2">
            Email Message
          </label>
          <textarea
            value={msg}
            onChange={handleMsg}
            placeholder="Enter your email content..."
            className="w-full h-32 border-2 border-blue-500 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Upload */}
        <div className="mt-6">
          <label className="block text-sm lg:text-xl font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <div className="rounded-2xl p-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:scale-[1.01] transition-transform">
            <div className="rounded-2xl bg-white p-6 text-center">
              <input
                key={fileInputKey} // important for resetting
                type="file"
                onChange={handleFile}
                className="w-full text-sm text-gray-700 file:px-6 file:py-3 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-indigo-600 file:text-white file:font-semibold hover:file:from-blue-700 hover:file:to-indigo-700 transition"
              />
              <p className="mt-4 text-sm text-gray-500">
                Upload Excel (.xlsx) file with email list
              </p>
            </div>
          </div>
        </div>

        {/* Email Count */}
        <p className="mt-4 text-sm lg:text-xl text-gray-700 font-medium">
          Total Emails: <span className="text-blue-700 ml-1">{emailList.length}</span>
        </p>

        {/* Send Button */}
        <button
          onClick={send}
          disabled={status}
          className={`mt-6 w-full py-3 rounded-lg font-bold text-white bg-gradient-to-br from-blue-500 to-black  hover:from-blue-700 hover:via-indigo-600transition duration-300 ${
            status ? "opacity-60" : ""
          }`}
        >
          {status ? "Sending..." : "Send Email"}
        </button>
      </div>
    </div>
  );
}

export default App;
