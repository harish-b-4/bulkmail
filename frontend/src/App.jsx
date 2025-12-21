import { useState } from "react"
import axios from "axios"
import * as XLSX from "xlsx"

function App() {

  const [msg, setMsg] = useState("")
  const [status, setStatus] = useState(false)
  const [emailList, setemailList] = useState([])

  function handlemsg(evt) {
    setMsg(evt.target.value)
  }

  function handlefile(event) {
    const file = event.target.files[0]
    const reader = new FileReader()

    reader.onload = function (event) {
      const data = event.target.result
      const workbook = XLSX.read(data, { type: "binary" })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const emailList = XLSX.utils.sheet_to_json(worksheet, { header: "A" })
      const totalemail = emailList.map(item => item.A)
      setemailList(totalemail)
    }

    reader.readAsBinaryString(file)
  }

  function send() {
    setStatus(true);

    axios.post("https://bulkmail-backend-izr5.onrender.com/sendmail", {
      msg: msg,
      emailList: emailList
    })
      .then(function (response) {

        // ✅ CORRECT CHECK
        if (response.data.success === true) {
          alert("Email sent successfully")

          setMsg("")
          setemailList([])
          document.getElementById("fileInput").value = ""

        } else {
          alert("Failed to send email")
        }

        setStatus(false);
      })
      .catch(function (error) {
        console.error(error);
        alert("Server error");
        setStatus(false);
      });
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-400 flex items-center justify-center px-3 sm:px-4">

      <div className="bg-white w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">

        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900">
          Bulk Mail Sender
        </h1>

        {/* Message Box */}
        <div className="mt-4 sm:mt-6">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">
            Email Message
          </label>

          <textarea
            onChange={handlemsg}
            value={msg}
            placeholder="Enter your email content..."
            className="w-full h-24 sm:h-32 border rounded-lg p-2 sm:p-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* File Upload */}
        <div className="mt-4 sm:mt-6">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1 sm:mb-2">
            Upload File
          </label>

          <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:bg-blue-50">
            <input
              id="fileInput"
              type="file"
              onChange={handlefile}
              className="w-full text-sm"
            />
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Upload .xlsx file with email list
            </p>
          </div>
        </div>

        {/* Email Count */}
        <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-700 font-medium">
          Total Emails :
          <span className="text-blue-700 ml-1">{emailList.length}</span>
        </p>

        {/* Send Button */}
        <button
          onClick={send}
          className="mt-5 sm:mt-6 w-full bg-blue-900 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-800 transition duration-300"
        >
          {status ? "Sending..." : "Send Email"}
        </button>

      </div>
    </div>

  )
}

export default App
