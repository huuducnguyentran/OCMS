import { useState } from "react";
import { Form, Input, Button, Upload, message, Card, Typography, DatePicker, Space, Spin, Alert } from "antd";
import { UploadOutlined, ArrowLeftOutlined, SaveOutlined, ScanOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";
import axios from "axios";
import dayjs from "dayjs";

const { Title, Text } = Typography;

// Azure Computer Vision API Configuration
const AZURE_COMPUTER_VISION_ENDPOINT = "https://ocms-web-certificate.cognitiveservices.azure.com/";
const AZURE_COMPUTER_VISION_API_KEY = "8rHOmSoL7gQ4J7kmIl6OwMTmbeVYi8caawNgkOkxEbDRUiV8PShBJQQJ99BDACYeBjFXJ3w3AAAFACOG9MDn";

const CreateExCertificatePage = () => {
  const [form] = Form.useForm();
  const { id: candidateId } = useParams();
  const navigate = useNavigate();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // Hàm trích xuất tên chứng chỉ từ văn bản
  const extractCertificateName = (textLines) => {
    // Kiểm tra xem có phải là giấy phép lái xe không
    for (const line of textLines) {
      if (/giấy phép lái xe|driver'?s? licen[sc]e/i.test(line)) {
        return "Driver License";
      }
    }
    
    // Kiểm tra xem có phải là chứng chỉ IELTS không
    for (const line of textLines) {
      if (/ielts|test report form|international english language testing system/i.test(line)) {
        return "IELTS Certificate";
      }
    }
    
    // Kiểm tra xem có phải là chứng chỉ TOEIC không
    for (const line of textLines) {
      if (/toeic|test of english|listening and reading/i.test(line)) {
        return "TOEIC Certificate";
      }
    }
    
    // Kiểm tra xem có phải là chứng chỉ TOEFL không
    for (const line of textLines) {
      if (/toefl|test of english as a foreign language/i.test(line)) {
        return "TOEFL Certificate";
      }
    }
    
    return null;
  };

  // Hàm trích xuất mã chứng chỉ từ văn bản
  const extractPossibleCertificateCode = (textLines) => {
    // Kiểm tra loại chứng chỉ
    const certificateName = extractCertificateName(textLines);
    
    // Xử lý riêng cho TOEFL
    if (certificateName === "TOEFL Certificate") {
      // Tìm Registration Number hoặc Appointment Number (16 chữ số, thường chia làm 4 nhóm)
      for (const line of textLines) {
        if (/registration number|appointment number/i.test(line)) {
          // Tìm mẫu 4 nhóm số, mỗi nhóm 4 số
          const match = line.match(/\d{4}\s+\d{4}\s+\d{4}\s+\d{4}/);
          if (match) return match[0];
          
          // Tìm mẫu 16 chữ số liên tiếp
          const match2 = line.match(/\d{16}/);
          if (match2) return match2[0].replace(/(.{4})(?=.)/g, '$1 '); // Chia thành nhóm 4 số
          
          // Lấy tất cả số trong dòng này
          const allDigits = line.match(/\d+/g);
          if (allDigits && allDigits.join('').length >= 16) {
            return allDigits.join('').substring(0, 16).replace(/(.{4})(?=.)/g, '$1 ');
          }
        }
      }
      
      // Tìm bất kỳ dãy 16 chữ số nào trong văn bản
      for (const line of textLines) {
        const match = line.match(/\d{16}/);
        if (match) return match[0].replace(/(.{4})(?=.)/g, '$1 ');
        
        // Hoặc tìm mẫu 4 nhóm số, mỗi nhóm 4 số
        const groupMatch = line.match(/\d{4}\s+\d{4}\s+\d{4}\s+\d{4}/);
        if (groupMatch) return groupMatch[0];
      }
    }
    
    // Xử lý riêng cho TOEIC
    if (certificateName === "TOEIC Certificate") {
      // Tìm mã chứng chỉ TOEIC là dãy 7 chữ số
      for (const line of textLines) {
        // Tìm chuỗi có đúng 7 chữ số liên tiếp 
        const match = line.match(/\b\d{7}\b/);
        if (match) return match[0];
      }
      
      // Tìm bất kỳ chuỗi nào có dạng mã/số hiệu
      for (const line of textLines) {
        const match = line.match(/\b([A-Z0-9]{6,8})\b/i);
        if (match) return match[1];
      }
    }
    
    // Xử lý cho IELTS và các chứng chỉ khác
    if (certificateName === "IELTS Certificate") {
      // Mẫu cho số báo danh IELTS (thường là 6-7 chữ số)
      for (const line of textLines) {
        // Tìm Candidate Number
        if (/candidate\s*number/i.test(line)) {
          const match = line.match(/\d{6,7}/);
          if (match) return match[0];
        }
        
        // Tìm Test Report Form Number
        if (/test report form number/i.test(line)) {
          const match = line.match(/(\d{2}VN\d+|\d{2}[A-Z]{2}\d+)/i);
          if (match) return match[0];
        }
      }
      
      // Tìm bất kỳ số nào có 6-7 chữ số (có thể là số báo danh)
      for (const line of textLines) {
        const match = line.match(/\b\d{6,7}\b/);
        if (match) return match[0];
      }
    }
    
    // Mẫu cụ thể cho giấy phép lái xe Việt Nam
    if (certificateName === "Driver License") {
      const driverLicensePatterns = [
        /số\/no\s*:\s*([0-9]+)/i,
        /số\/no\s*[:.]\s*([0-9]+)/i,
        /số[:.]\s*([0-9]+)/i,
        /no[:.]\s*([0-9]+)/i,
        /số\s*([0-9]{8,})/i,  // Số GPLX thường có 8+ chữ số
      ];
      
      // Tìm mã bằng mẫu cụ thể cho GPLX trước
      for (const line of textLines) {
        for (const pattern of driverLicensePatterns) {
          const match = line.match(pattern);
          if (match && match[1]) return match[1];
        }
      }
    }
    
    // Các mẫu chung cho các loại chứng chỉ
    const codePatterns = [
      /cert(ificate)?\s*[#:]?\s*([A-Z0-9-]+)/i,
      /\b(no|number|id)[\s:.]\s*([A-Z0-9-]+)/i,
      /\b([A-Z][A-Z0-9]{5,})\b/,  // Chữ in hoa và số, ít nhất 6 ký tự
      /gplx[:.]\s*([0-9]+)/i,
      /license[:.]\s*([0-9]+)/i,
    ];
    
    for (const line of textLines) {
      for (const pattern of codePatterns) {
        const match = line.match(pattern);
        if (match && match[2]) return match[2];
        if (match && match[1] && match[1].length >= 6) return match[1];
      }
    }
    
    return null;
  };

  // Hàm trích xuất tổ chức cấp từ văn bản
  const extractPossibleIssuer = (textLines) => {
    // Kiểm tra loại chứng chỉ
    const certificateName = extractCertificateName(textLines);
    
    // Xử lý riêng cho TOEFL - tổ chức cấp luôn là ETS
    if (certificateName === "TOEFL Certificate") {
      return "ETS (Educational Testing Service)";
    }
    
    // Xử lý riêng cho TOEIC
    if (certificateName === "TOEIC Certificate") {
      // Kiểm tra tổ chức cấp TOEIC phổ biến
      for (const line of textLines) {
        if (/ETS|educational testing service/i.test(line)) {
          return "ETS (Educational Testing Service)";
        }
        if (/IIBC|institute for international business communication/i.test(line)) {
          return "IIBC (Institute for International Business Communication)";
        }
      }
      
      return "ETS (Educational Testing Service)";
    }
    
    // Xử lý riêng cho IELTS
    if (certificateName === "IELTS Certificate") {
      // Kiểm tra các tổ chức cấp IELTS phổ biến
      for (const line of textLines) {
        if (/british council|idp|cambridge assessment|cambridge english/i.test(line)) {
          return "British Council / IDP / Cambridge Assessment English";
        }
        if (/british council/i.test(line)) {
          return "British Council";
        }
        if (/idp/i.test(line)) {
          return "IDP Education";
        }
        if (/cambridge assessment|cambridge english/i.test(line)) {
          return "Cambridge Assessment English";
        }
      }
      
      return "British Council / IDP / Cambridge Assessment English";
    }
    
    // Xử lý riêng cho giấy phép lái xe
    if (certificateName === "Driver License") {
      return "BỘ GTVT";
    }
    
    // Mẫu cụ thể cho GPLX Việt Nam (Bộ GTVT)
    for (const line of textLines) {
      if (/bộ\s*gtvt/i.test(line)) {
        return "BỘ GTVT";
      }
      if (/sở\s*gtvt/i.test(line)) {
        return "SỞ GTVT";
      }
      if (/ministry of transport/i.test(line)) {
        return "BỘ GTVT";
      }
      if (/department of transport/i.test(line)) {
        return "SỞ GTVT";
      }
    }
    
    // Các mẫu chung
    const issuerPatterns = [
      /issued\s*by\s*[:.]?\s*(.+)/i,
      /provider\s*[:.]?\s*(.+)/i,
      /certif(ying|ication)\s*authority\s*[:.]?\s*(.+)/i,
      /organization\s*[:.]?\s*(.+)/i,
      /giám đốc\s*(.+)/i,
      /cấp bởi\s*(.+)/i,
    ];
    
    for (const line of textLines) {
      for (const pattern of issuerPatterns) {
        const match = line.match(pattern);
        if (match && match[1]) return match[1].trim();
        if (match && match[2]) return match[2].trim();
      }
    }
    
    // Trả về dòng đầu tiên có thể là tên tổ chức
    for (const line of textLines) {
      if (/bộ|sở|cục|department|ministry/i.test(line) && 
          line.length > 5 && line.length < 50) {
        return line.trim();
      }
    }
    
    return null;
  };

  // Hàm trích xuất ngày tháng từ văn bản
  const extractPossibleDates = (textLines) => {
    const dates = [];
    
    // Kiểm tra loại chứng chỉ
    const certificateName = extractCertificateName(textLines);
    
    // Xử lý riêng cho TOEFL
    if (certificateName === "TOEFL Certificate") {
      // Tìm ngày cấp từ Test Date
      let issueDate = null;
      
      // Tìm dòng có "Test Date"
      for (const line of textLines) {
        if (/test date/i.test(line)) {
          // Tìm định dạng ngày trong cùng dòng
          // Hỗ trợ định dạng như "19 Sep 2015" hoặc "DD/MM/YYYY"
          const monthNames = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
          
          // Tìm định dạng DD Tháng YYYY (ví dụ: 19 Sep 2015)
          const dateMatch1 = line.match(/(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/i);
          if (dateMatch1) {
            const day = parseInt(dateMatch1[1], 10);
            const month = monthNames.findIndex(m => dateMatch1[2].toLowerCase().includes(m)) + 1;
            const year = parseInt(dateMatch1[3], 10);
            
            if (month > 0) {
              issueDate = `${day}/${month}/${year}`;
            }
          } else {
            // Tìm định dạng DD/MM/YYYY
            const dateMatch2 = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (dateMatch2) {
              issueDate = `${dateMatch2[1]}/${dateMatch2[2]}/${dateMatch2[3]}`;
            }
          }
          
          if (issueDate) {
            break;
          }
        }
      }
      
      // Nếu tìm được ngày cấp, thêm vào danh sách
      if (issueDate) {
        dates.push({
          type: 'issueDate',
          date: issueDate,
          priority: 10
        });
        
        // Tự động tính ngày hết hạn (cộng thêm 2 năm)
        try {
          const parts = issueDate.split(/[\/\.-]/);
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10) + 2; // Cộng thêm 2 năm
            
            const expiryDate = new Date(year, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();
            
            dates.push({
              type: 'expiryDate',
              date: `${day2}/${month2}/${year2}`,
              priority: 10,
              calculated: true
            });
          }
        } catch (e) {
          console.error("Error calculating TOEFL expiry date:", e);
        }
      } else {
        // Nếu không tìm được ngày cấp từ "Test Date", tìm tất cả các ngày trong văn bản
        const allDates = [];
        
        for (const line of textLines) {
          // Tìm định dạng DD/MM/YYYY
          const dateMatches = [...line.matchAll(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g)];
          for (const match of dateMatches) {
            allDates.push({
              day: parseInt(match[1], 10),
              month: parseInt(match[2], 10) - 1,
              year: parseInt(match[3], 10),
              date: new Date(parseInt(match[3], 10), parseInt(match[2], 10) - 1, parseInt(match[1], 10))
            });
          }
          
          // Tìm định dạng "DD Month YYYY"
          const monthPatterns = [
            /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi,
            /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi
          ];
          
          for (const pattern of monthPatterns) {
            const dateMatches = [...line.matchAll(pattern)];
            for (const match of dateMatches) {
              const monthName = match[2].toLowerCase().substring(0, 3);
              const monthIndex = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"].indexOf(monthName);
              
              if (monthIndex !== -1) {
                allDates.push({
                  day: parseInt(match[1], 10),
                  month: monthIndex,
                  year: parseInt(match[3], 10),
                  date: new Date(parseInt(match[3], 10), monthIndex, parseInt(match[1], 10))
                });
              }
            }
          }
        }
        
        // Sắp xếp các ngày theo thứ tự thời gian
        allDates.sort((a, b) => a.date - b.date);
        
        // Nếu tìm được ít nhất một ngày, dùng làm ngày cấp
        if (allDates.length > 0) {
          // Bỏ qua ngày cũ nhất (có thể là ngày sinh)
          const issueDateObj = allDates.length > 1 ? allDates[1] : allDates[0];
          
          dates.push({
            type: 'issueDate',
            date: `${issueDateObj.day}/${issueDateObj.month + 1}/${issueDateObj.year}`,
            priority: 8
          });
          
          // Tính ngày hết hạn
          const expiryDate = new Date(issueDateObj.year + 2, issueDateObj.month, issueDateObj.day);
          dates.push({
            type: 'expiryDate',
            date: `${expiryDate.getDate()}/${expiryDate.getMonth() + 1}/${expiryDate.getFullYear()}`,
            priority: 8,
            calculated: true
          });
        }
      }
      
      return dates;
    }
    
    // Xử lý riêng cho IELTS - IELTS không có "issue date" rõ ràng, chỉ có ngày trên giấy chứng nhận
    if (certificateName === "IELTS Certificate") {
      // IELTS chỉ có ngày như một đường viền và một ngày, không có từ "issue date" rõ ràng
      const allFoundDates = [];
      
      // Tìm tất cả ngày trong chứng chỉ IELTS
      for (const line of textLines) {
        // Tìm bất kỳ định dạng ngày nào, không cần từ khóa "date"
        let dateMatches = [...line.matchAll(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g)];
        // Hoặc định dạng như 18/FEB/2023 phổ biến trong IELTS
        const altMatches = [...line.matchAll(/(\d{1,2})\/([A-Za-z]{3})\/(\d{4})/g)];
        
        if (dateMatches.length > 0) {
          for (const match of dateMatches) {
            allFoundDates.push({
              day: parseInt(match[1], 10),
              month: parseInt(match[2], 10) - 1,
              year: parseInt(match[3], 10),
              text: `${match[1]}/${match[2]}/${match[3]}`
            });
          }
        }
        
        if (altMatches.length > 0) {
          const monthMap = {
            'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
            'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
          };
          
          for (const match of altMatches) {
            const monthStr = match[2].toUpperCase();
            if (monthMap[monthStr] !== undefined) {
              allFoundDates.push({
                day: parseInt(match[1], 10),
                month: monthMap[monthStr],
                year: parseInt(match[3], 10),
                text: `${match[1]}/${match[2]}/${match[3]}`
              });
            }
          }
        }
      }
      
      // Sắp xếp ngày theo mới nhất (trễ nhất)
      allFoundDates.sort((a, b) => {
        const dateA = new Date(a.year, a.month, a.day);
        const dateB = new Date(b.year, b.month, b.day);
        return dateB - dateA; // Sắp xếp giảm dần (mới nhất trước)
      });
      
      console.log("Tất cả ngày tìm thấy trong IELTS:", allFoundDates);
      
      // Lấy ngày mới nhất làm ngày cấp (thường là ngày có điểm, không phải ngày thi)
      if (allFoundDates.length > 0) {
        const latestDate = allFoundDates[0]; // Ngày mới nhất
        
        dates.push({
          type: 'issueDate',
          date: `${latestDate.day}/${latestDate.month + 1}/${latestDate.year}`,
          priority: 10
        });
        
        // Tự động thêm ngày hết hạn 2 năm sau ngày cấp (tất cả chứng chỉ IELTS có hạn 2 năm)
        try {
          const expiryDate = new Date(latestDate.year + 2, latestDate.month, latestDate.day);
          const day2 = expiryDate.getDate();
          const month2 = expiryDate.getMonth() + 1;
          const year2 = expiryDate.getFullYear();
          
          dates.push({
            type: 'expiryDate',
            date: `${day2}/${month2}/${year2}`,
            priority: 9,
            calculated: true
          });
        } catch (e) {
          console.error("Error calculating IELTS expiry date:", e);
        }
      }
      // Nếu không tìm thấy ngày nào, không cần xử lý thêm
    }
    
    // Xử lý riêng cho giấy phép lái xe - tìm cả ngày cấp và ngày hết hạn
    if (certificateName === "Driver License") {
      let issueDateFound = false;
      let expiryDateFound = false;
      
      // Tìm ngày hết hạn trước (thường có từ khóa "valid until", "có giá trị đến", "expiry date" v.v)
      for (const line of textLines) {
        if (/có giá trị đến|expires|valid until|expiry date|expiration date|valid to/i.test(line)) {
          // Kiểm tra nếu là không thời hạn
          if (/không thời hạn|no expiration/i.test(line)) {
            dates.push({
              type: 'expiryDate',
              date: "Không thời hạn",
              priority: 10
            });
            expiryDateFound = true;
          } else {
            // Tìm định dạng ngày DD/MM/YYYY
            const match = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (match) {
              dates.push({
                type: 'expiryDate',
                date: `${match[1]}/${match[2]}/${match[3]}`,
                priority: 10
              });
              expiryDateFound = true;
            }
          }
        }
      }
      
      // Tìm ngày cấp (thường có từ khóa "issue date", "cấp ngày", v.v)
      for (const line of textLines) {
        if (/cấp ngày|issue date|issued on|ngày\/date|date of issue/i.test(line)) {
          const match = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
          if (match) {
            dates.push({
              type: 'issueDate',
              date: `${match[1]}/${match[2]}/${match[3]}`,
              priority: 10
            });
            issueDateFound = true;
          }
        }
      }
      
      // Nếu không tìm được ngày cấp/ngày hết hạn cụ thể, tìm các ngày trong văn bản
      if (!issueDateFound || !expiryDateFound) {
        const allFoundDates = [];
        
        // Tìm tất cả ngày trong giấy phép lái xe
        for (const line of textLines) {
          let dateMatches = [...line.matchAll(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g)];
          
          if (dateMatches.length > 0) {
            for (const match of dateMatches) {
              allFoundDates.push({
                day: parseInt(match[1], 10),
                month: parseInt(match[2], 10) - 1,
                year: parseInt(match[3], 10),
                text: `${match[1]}/${match[2]}/${match[3]}`,
                line: line
              });
            }
          }
        }
        
        // Sắp xếp ngày theo thứ tự thời gian (cũ đến mới)
        allFoundDates.sort((a, b) => {
          const dateA = new Date(a.year, a.month, a.day);
          const dateB = new Date(b.year, b.month, b.day);
          return dateA - dateB;
        });
        
        console.log("Tất cả ngày tìm thấy trong GPLX:", allFoundDates);
        
        // Nếu có ít nhất 2 ngày khác nhau, giả định ngày đầu tiên là ngày cấp, ngày sau là ngày hết hạn
        if (allFoundDates.length >= 2) {
          // Ngày cấp (ngày đầu tiên nếu chưa tìm thấy)
          if (!issueDateFound) {
            const firstDate = allFoundDates[0];
            dates.push({
              type: 'issueDate',
              date: `${firstDate.day}/${firstDate.month + 1}/${firstDate.year}`,
              priority: 8
            });
          }
          
          // Ngày hết hạn (ngày cuối cùng nếu chưa tìm thấy)
          if (!expiryDateFound) {
            const lastDate = allFoundDates[allFoundDates.length - 1];
            dates.push({
              type: 'expiryDate',
              date: `${lastDate.day}/${lastDate.month + 1}/${lastDate.year}`,
              priority: 8
            });
          }
        } 
        // Nếu chỉ tìm thấy 1 ngày, đó có thể là ngày cấp
        else if (allFoundDates.length === 1 && !issueDateFound) {
          const onlyDate = allFoundDates[0];
          dates.push({
            type: 'issueDate',
            date: `${onlyDate.day}/${onlyDate.month + 1}/${onlyDate.year}`,
            priority: 7
          });
        }
      }
    }
    
    // Xử lý chung cho các loại chứng chỉ - tìm ngày ở cuối trang 
    // Tập trung vào 7 dòng cuối cùng
    const lastLines = textLines.slice(-7);
    
    // Tìm dòng có chữ "Date" ở cuối trang
    let dateLineFound = false;
    for (const line of lastLines) {
      if (/^date\s*$/i.test(line) || /^date[: ]/i.test(line) || line.trim().toLowerCase() === 'date') {
        dateLineFound = true;
        continue;
      }
      
      // Kiểm tra dòng tiếp theo sau dòng có chữ "Date"
      if (dateLineFound) {
        // Tìm định dạng ngày DD/MM/YYYY hoặc DD-MM-YYYY
        let dateMatch = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
        // Hoặc định dạng như 22/02/2023
        if (dateMatch) {
          dates.push({
            type: 'issueDate',
            date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
            priority: 10
          });
          
          // Tự động thêm ngày hết hạn 2 năm sau ngày cấp
          try {
            const day = parseInt(dateMatch[1], 10);
            const month = parseInt(dateMatch[2], 10) - 1; // JS tháng bắt đầu từ 0
            const year = parseInt(dateMatch[3], 10);
            
            const expiryDate = new Date(year + 2, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();
            
            dates.push({
              type: 'expiryDate',
              date: `${day2}/${month2}/${year2}`,
              priority: 9,
              calculated: true // Đánh dấu đây là ngày được tính tự động
            });
          } catch (e) {
            console.error("Error calculating expiry date:", e);
          }
          
          break; // Đã tìm thấy, dừng vòng lặp
        }
        
        dateLineFound = false; // Reset để tránh xử lý nhiều dòng 
      }
    }
    
    // Tìm ngày ở cuối trang không có từ khóa "Date" rõ ràng
    if (!dates.some(d => d.type === 'issueDate')) {
      for (const line of lastLines) {
        // Tìm định dạng ngày DD/MM/YYYY ở dòng cuối
        const dateMatch = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
        if (dateMatch) {
          dates.push({
            type: 'issueDate',
            date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
            priority: 8
          });
          
          // Tự động thêm ngày hết hạn 2 năm sau ngày cấp
          try {
            const day = parseInt(dateMatch[1], 10);
            const month = parseInt(dateMatch[2], 10) - 1;
            const year = parseInt(dateMatch[3], 10);
            
            const expiryDate = new Date(year + 2, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();
            
            dates.push({
              type: 'expiryDate',
              date: `${day2}/${month2}/${year2}`,
              priority: 7,
              calculated: true
            });
          } catch (e) {
            console.error("Error calculating expiry date:", e);
          }
          
          break;
        }
      }
    }
    
    // Giấy phép lái xe - tìm ngày ở góc dưới bên phải
    if (certificateName === "Driver License" && !dates.some(d => d.type === 'issueDate')) {
      // Mẫu định dạng ngày tháng năm Việt Nam ở góc phải dưới
      const vietnameseDatePattern = /ngày\/date\s*(\d{1,2})\s*tháng\/month\s*(\d{1,2})\s*năm\/year\s*(\d{4})/i;
      const vietnameseDatePattern2 = /ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i;
      const vietnameseDatePattern3 = /(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i;
      
      for (const line of lastLines) {
        // Mẫu 1: ngày/date DD tháng/month MM năm/year YYYY
        let match = line.match(vietnameseDatePattern);
        if (match) {
          const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
          dates.push({
            type: 'issueDate',
            date: issueDate,
            priority: 10
          });
          
          // Tự động thêm ngày hết hạn 2 năm sau
          try {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const year = parseInt(match[3], 10);
            
            const expiryDate = new Date(year + 2, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();
            
            dates.push({
              type: 'expiryDate',
              date: `${day2}/${month2}/${year2}`,
              priority: 9,
              calculated: true
            });
          } catch (e) {
            console.error("Error calculating driver license expiry date:", e);
          }
          
          continue;
        }
        
        // Mẫu 2: ngày DD tháng MM năm YYYY
        match = line.match(vietnameseDatePattern2);
        if (match) {
          const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
          dates.push({
            type: 'issueDate',
            date: issueDate,
            priority: 9
          });
          
          // Tự động thêm ngày hết hạn 2 năm sau
          try {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const year = parseInt(match[3], 10);
            
            const expiryDate = new Date(year + 2, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();
            
            dates.push({
              type: 'expiryDate',
              date: `${day2}/${month2}/${year2}`,
              priority: 8,
              calculated: true
            });
          } catch (e) {
            console.error("Error calculating driver license expiry date:", e);
          }
          
          continue;
        }
        
        // Mẫu 3: DD tháng MM năm YYYY
        match = line.match(vietnameseDatePattern3);
        if (match) {
          const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
          dates.push({
            type: 'issueDate',
            date: issueDate,
            priority: 8
          });
          
          // Tự động thêm ngày hết hạn 2 năm sau
          try {
            const day = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const year = parseInt(match[3], 10);
            
            const expiryDate = new Date(year + 2, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();
            
            dates.push({
              type: 'expiryDate',
              date: `${day2}/${month2}/${year2}`,
              priority: 7,
              calculated: true
            });
          } catch (e) {
            console.error("Error calculating driver license expiry date:", e);
          }
          
          continue;
        }
      }
    }
    
    // Tìm ngày cấp trong toàn bộ văn bản nếu chưa tìm thấy
    if (!dates.some(d => d.type === 'issueDate')) {
      for (const line of textLines) {
        if (/ngày\/date|cấp ngày|issue date|issued on/i.test(line)) {
          // Tìm mẫu ngày DD/MM/YYYY hoặc ngày DD tháng MM năm YYYY
          const match = line.match(/(\d{1,2})[\/\s\.](\d{1,2})[\/\s\.](\d{4})/);
          if (match) {
            const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
            dates.push({
              type: 'issueDate',
              date: issueDate,
              priority: 5
            });
            
            // Thêm ngày hết hạn nếu chưa có
            if (!dates.some(d => d.type === 'expiryDate')) {
              try {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const year = parseInt(match[3], 10);
                
                const expiryDate = new Date(year + 2, month, day);
                const day2 = expiryDate.getDate();
                const month2 = expiryDate.getMonth() + 1;
                const year2 = expiryDate.getFullYear();
                
                dates.push({
                  type: 'expiryDate',
                  date: `${day2}/${month2}/${year2}`,
                  priority: 4,
                  calculated: true
                });
              } catch (e) {
                console.error("Error calculating expiry date:", e);
              }
            }
          }
        }
      }
    }
    
    // Tìm ngày hết hạn (thường đi kèm với "expires", "có giá trị đến")
    // Chỉ tìm nếu chưa tính được ngày hết hạn
    if (!dates.some(d => d.type === 'expiryDate')) {
      for (const line of textLines) {
        if (/có giá trị đến|expires|valid until|expiry date|expiration date/i.test(line)) {
          if (/không thời hạn|no expiration/i.test(line)) {
            dates.push({
              type: 'expiryDate',
              date: "Không thời hạn",
              priority: 6
            });
          } else {
            const match = line.match(/(\d{1,2})[\/\s\.](\d{1,2})[\/\s\.](\d{4})/);
            if (match) {
              const expiryDate = `${match[1]}/${match[2]}/${match[3]}`;
              dates.push({
                type: 'expiryDate',
                date: expiryDate,
                priority: 6
              });
            }
          }
        }
      }
    }
    
    // Mẫu cụ thể cho ngày trên GPLX Việt Nam - Thêm cờ g cho tất cả các regex
    const datePatterns = [
      // DD/MM/YYYY hoặc DD-MM-YYYY
      /\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})\b/g,
    ];
    
    // Tìm tất cả các ngày trong văn bản
    for (const line of textLines) {
      // Sử dụng cách an toàn hơn để tìm tất cả các kết quả khớp
      for (const pattern of datePatterns) {
        // Đảm bảo pattern có cờ g
        let match;
        // Sử dụng exec trong vòng lặp thay vì matchAll
        while ((match = pattern.exec(line)) !== null) {
          // Kiểm tra xem ngày này đã được gán loại chưa
          const dateStr = `${match[1]}/${match[2]}/${match[3]}`;
          if (!dates.some(d => d.date === dateStr)) {
            dates.push({
              type: 'unknown',
              date: dateStr,
              priority: 1
            });
          }
        }
      }
    }
    
    // Sắp xếp ngày theo ưu tiên
    dates.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    
    // Thêm ngày hết hạn tự động nếu đã tìm thấy ngày cấp nhưng chưa có ngày hết hạn
    if (dates.some(d => d.type === 'issueDate') && !dates.some(d => d.type === 'expiryDate')) {
      const issueDate = dates.find(d => d.type === 'issueDate');
      if (issueDate && issueDate.date !== "Không thời hạn") {
        try {
          // Xử lý các định dạng ngày khác nhau
          let day, month, year;
          const dateParts = issueDate.date.split(/[\/\.-]/);
          
          if (dateParts.length === 3) {
            if (isNaN(dateParts[1])) {
              // Tháng là chữ
              const monthMap = {
                'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
              };
              day = parseInt(dateParts[0], 10);
              month = monthMap[dateParts[1].toUpperCase()] - 1;
              year = parseInt(dateParts[2], 10);
            } else {
              // Tháng là số
              day = parseInt(dateParts[0], 10);
              month = parseInt(dateParts[1], 10) - 1;
              year = parseInt(dateParts[2], 10);
            }
            
            const expiryDate = new Date(year + 2, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();
            
            dates.push({
              type: 'expiryDate',
              date: `${day2}/${month2}/${year2}`,
              priority: 3,
              calculated: true
            });
          }
        } catch (e) {
          console.error("Error calculating final expiry date:", e);
        }
      }
    }
    
    return dates;
  };

  // Hàm phân tích ảnh chứng chỉ trực tiếp bằng Azure Computer Vision
  const analyzeImageWithAzure = async (file) => {
    setAnalyzing(true);
    
    try {
      // Chuyển file thành dạng ArrayBuffer
      const fileBuffer = await file.arrayBuffer();
      
      // Chuẩn bị API call đến Azure Computer Vision (Read API)
      const readUrl = `${AZURE_COMPUTER_VISION_ENDPOINT}vision/v3.2/read/analyze`;
      
      // Gửi yêu cầu phân tích đến Azure
      const submitResponse = await axios.post(readUrl, fileBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Ocp-Apim-Subscription-Key': AZURE_COMPUTER_VISION_API_KEY,
        }
      });
      
      // Lấy vị trí để kiểm tra kết quả phân tích
      const operationLocation = submitResponse.headers['operation-location'];
      if (!operationLocation) {
        throw new Error('Operation location not found in response');
      }
      
      // Chờ phân tích hoàn tất (với thử lại)
      let analysisResult;
      let retries = 10;
      
      while (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây
        
        const resultResponse = await axios.get(operationLocation, {
          headers: {
            'Ocp-Apim-Subscription-Key': AZURE_COMPUTER_VISION_API_KEY,
          }
        });
        
        if (resultResponse.data.status === 'succeeded') {
          analysisResult = resultResponse.data;
          break;
        } else if (resultResponse.data.status === 'failed') {
          throw new Error('Text analysis failed');
        }
        
        retries--;
      }
      
      if (!analysisResult) {
        throw new Error('Text analysis did not complete in time');
      }
      
      // Trích xuất văn bản từ kết quả phân tích
      const extractedText = [];
      if (analysisResult.analyzeResult && analysisResult.analyzeResult.readResults) {
        for (const page of analysisResult.analyzeResult.readResults) {
          for (const line of page.lines || []) {
            extractedText.push(line.text);
          }
        }
      }
      
      console.log("Extracted text:", extractedText); // Để debug
      
      try {
        // Trích xuất thông tin chứng chỉ
        const possibleCertName = extractCertificateName(extractedText);
        const possibleCode = extractPossibleCertificateCode(extractedText);
        const possibleIssuer = extractPossibleIssuer(extractedText);
        const possibleDates = extractPossibleDates(extractedText);
        
        const certificateInfo = {
          text: extractedText.join('\n'),
          possibleCode: possibleCode,
          possibleCertName: possibleCertName,
          possibleIssuer: possibleIssuer,
          possibleDates: possibleDates,
        };
        
        // Kiểm tra xem có phải là chứng chỉ/giấy phép hợp lệ không
        const isCertificateOrLicense = 
          (possibleCertName !== null) || // Đã nhận dạng được tên chứng chỉ cụ thể
          (possibleCode !== null && possibleDates.length > 0) || // Có mã số và ngày tháng
          (/certificate|chứng chỉ|diploma|bằng|license|giấy phép|ielts|toefl|toeic/i.test(extractedText.join(' ')));
          
        if (!isCertificateOrLicense) {
          throw new Error('Cannot detect certificate or license in the image. Please upload a valid certificate image.');
        }
        
        // Hiển thị trong console các thông tin trích xuất được để debug
        console.log("Tất cả ngày tìm thấy:", possibleDates);
        console.log("Certificate Name:", certificateInfo.possibleCertName);
        console.log("Certificate Code:", certificateInfo.possibleCode);
        console.log("Issuing Organization:", certificateInfo.possibleIssuer);
        
        // Tạo hàm trợ giúp để chuyển đổi chuỗi ngày sang đối tượng moment
        const convertToMoment = (dateString) => {
          console.log("Converting date string to moment:", dateString);
          try {
            // Kiểm tra xem chuỗi ngày có chứa chữ cái không (ví dụ: FEB)
            if (/[A-Za-z]/.test(dateString)) {
              const parts = dateString.split(/[\/\.-]/);
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const monthStr = parts[1].toUpperCase();
                const year = parseInt(parts[2], 10);
                
                const monthMap = {
                  'JAN': 0, 'FEB': 1, 'MAR': 2, 'APR': 3, 'MAY': 4, 'JUN': 5,
                  'JUL': 6, 'AUG': 7, 'SEP': 8, 'OCT': 9, 'NOV': 10, 'DEC': 11
                };
                
                if (monthMap[monthStr.toUpperCase()] !== undefined) {
                  // Tạo đối tượng dayjs (tương thích với Ant Design)
                  const date = dayjs().year(year).month(monthMap[monthStr.toUpperCase()]).date(day);
                  console.log("Converted date with text month:", date.format('DD/MM/YYYY'));
                  return date;
                }
              }
            } else {
              // Xử lý định dạng DD/MM/YYYY
              const parts = dateString.split(/[\/\.-]/);
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Tháng trong JS bắt đầu từ 0
                const year = parseInt(parts[2], 10);
                
                // Đảm bảo giá trị hợp lệ
                if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
                  // Tạo đối tượng dayjs (tương thích với Ant Design)
                  const date = dayjs().year(year).month(month).date(day);
                  console.log("Converted numeric date:", date.format('DD/MM/YYYY'));
                  return date;
                }
              }
            }
          } catch (e) {
            console.error("Error converting date string:", e);
          }
          return null;
        };
        
        // Tự động điền thông tin
        if (certificateInfo.possibleCode) {
          form.setFieldsValue({ certificateCode: certificateInfo.possibleCode });
        }
        
        if (certificateInfo.possibleCertName) {
          form.setFieldsValue({ certificateName: certificateInfo.possibleCertName });
        }
        
        if (certificateInfo.possibleIssuer) {
          form.setFieldsValue({ issuingOrganization: certificateInfo.possibleIssuer });
        }
        
        // Xử lý ngày tháng
        const issueDates = possibleDates.filter(d => d.type === 'issueDate');
        const expiryDates = possibleDates.filter(d => d.type === 'expiryDate');
        
        // In ra tất cả ngày tìm thấy để debug
        console.log("Ngày cấp tìm thấy:", issueDates);
        console.log("Ngày hết hạn tìm thấy:", expiryDates);
        
        // Thiết lập ngày cấp
        if (issueDates.length > 0) {
          const issueDate = issueDates[0].date;
          console.log("Đang xử lý ngày cấp:", issueDate);
          
          if (issueDate && issueDate !== "Không thời hạn") {
            const momentDate = convertToMoment(issueDate);
            if (momentDate) {
              // Thiết lập giá trị ngày cấp
              setTimeout(() => {
                form.setFieldsValue({ issueDate: momentDate });
              }, 500);
            }
          }
        }
        
        // Thiết lập ngày hết hạn
        if (expiryDates.length > 0) {
          const expiryDate = expiryDates[0].date;
          console.log("Đang xử lý ngày hết hạn:", expiryDate);
          
          if (expiryDate && expiryDate !== "Không thời hạn") {
            const momentDate = convertToMoment(expiryDate);
            if (momentDate) {
              // Thiết lập giá trị ngày hết hạn
              setTimeout(() => {
                form.setFieldsValue({ expirationDate: momentDate });
              }, 500);
            }
          }
        }
        
        // Thêm thông báo đặc biệt cho IELTS
        if (certificateInfo.possibleCertName === "IELTS Certificate") {
          setTimeout(() => {
          }, 1500);
        }
        
        // Trích xuất điểm IELTS nếu là chứng chỉ IELTS
        if (certificateInfo.possibleCertName === "IELTS Certificate") {
          // Tìm các kết quả điểm IELTS 
          let overallBandScore = null;
          
          for (const line of extractedText) {
            // Tìm Overall Band Score
            if (/overall\s*band\s*score/i.test(line)) {
              const match = line.match(/(\d+\.\d+)/);
              if (match) {
                overallBandScore = match[1];
                break;
              }
            }
          }
          
          // Thêm thông tin điểm vào mã chứng chỉ nếu cần
          if (overallBandScore && certificateInfo.possibleCode) {
            form.setFieldsValue({ 
              certificateCode: `${certificateInfo.possibleCode} (Overall: ${overallBandScore})` 
            });
          }
        }
        
        setAnalysisResult({
          fileUrl: URL.createObjectURL(file),
          analysis: certificateInfo,
          completed: true
        });
        
        message.success("Analyzed successfully!");
        
        return certificateInfo;
      } catch (error) {
        console.error("Error analyzing image with Azure:", error);
        message.error("Analyze failed: " + (error.message || "Unknown error"));
        
        // Reset trạng thái phân tích và kết quả
        setAnalysisResult(null);
        form.resetFields();
        
        // Quan trọng: không chuyển tiếp lỗi để phương thức xử lý đúng
        return null;
      } finally {
        setAnalyzing(false);
      }
    } catch (error) {
      console.error("Error analyzing image with Azure:", error);
      message.error("Phân tích ảnh thất bại: " + (error.message || "Lỗi không xác định"));
      
      // Reset trạng thái phân tích và kết quả
      setAnalysisResult(null);
      form.resetFields();
      
      throw error;
    }
  };

  // Xử lý phân tích ảnh
  const handleAnalyzeImage = async () => {
    if (!fileList.length) {
      message.error("Vui lòng tải lên ảnh trước!");
      return;
    }
    
    const file = fileList[0].originFileObj;
    
    try {
      const result = await analyzeImageWithAzure(file);
      
      // Kiểm tra nếu không có kết quả (lỗi) thì xóa file đã chọn
      if (!result) {
        setFileList([]);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      message.error(error.message || "Không thể phân tích ảnh. Vui lòng đảm bảo đây là ảnh chứng chỉ hợp lệ.");
      
      // Reset file đã chọn khi phân tích thất bại
      setFileList([]);
    }
  };

  const handleSubmit = async (values) => {
    setUploading(true);
    const formData = new FormData();

    formData.append("CertificateCode", values.certificateCode);
    formData.append("CertificateName", values.certificateName);
    formData.append("IssuingOrganization", values.issuingOrganization);
    formData.append("CandidateId", candidateId);
    
    // Cả hai trường ngày đều là tùy chọn
    if (values.issueDate) {
      formData.append("IssueDate", values.issueDate.toISOString());
    }
    if (values.expirationDate) {
      formData.append("ExpirationDate", values.expirationDate.toISOString());
    }
    
    // Thêm file ảnh từ form upload
    if (values.certificateImage?.[0]?.originFileObj) {
      formData.append("CertificateImage", values.certificateImage[0].originFileObj);
    }

    try {
      await axiosInstance.post(API.CREATE_EXTERNAL_CERTIFICATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Certificate uploaded successfully!");
      navigate(`/candidates/${candidateId}`);
    } catch (error) {
      console.error("Upload error:", error);
      message.error("Failed to upload certificate.");
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
    }
    return isImage && isLt5M;
  };

  const handleChange = ({ fileList }) => setFileList(fileList);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <div className="mb-6">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`/candidates-view`)}
            className="mb-4"
          >
            Back to Candidate
          </Button>
          <Title level={2}>Upload External Certificate</Title>
          <Text type="secondary">
            Please fill in the certificate details and upload the image
          </Text>
        </div>

        {/* Hiển thị trạng thái phân tích */}
        {analyzing && (
          <div className="mb-4">
            <Alert
              message="Analyzing Certificate"
              description={
                <div className="flex items-center">
                  <Spin className="mr-2" />
                  <span>We're analyzing your certificate to extract information automatically...</span>
                </div>
              }
              type="info"
              showIcon
            />
          </div>
        )}

        {/* Hiển thị kết quả phân tích */}
        {analysisResult?.completed && analysisResult?.analysis && (
          <div className="mb-4">
            <Alert
              message="Certificate Analysis Results"
              description={
                <div>
                  {analysisResult.analysis.possibleCode && (
                    <p><strong>Detected Certificate Code:</strong> {analysisResult.analysis.possibleCode}</p>
                  )}
                  {analysisResult.analysis.possibleCertName && (
                    <p><strong>Detected Certificate Name:</strong> {analysisResult.analysis.possibleCertName}</p>
                  )}
                  {analysisResult.analysis.possibleIssuer && (
                    <p><strong>Detected Issuing Organization:</strong> {analysisResult.analysis.possibleIssuer}</p>
                  )}
                  {analysisResult.analysis.possibleDates && analysisResult.analysis.possibleDates.length > 0 && (
                    <div>
                      <p><strong>Detected Dates:</strong></p>
                      <ul className="pl-5">
                        {analysisResult.analysis.possibleDates.map((dateObj, index) => (
                          <li key={index}>
                            {dateObj.type === 'issueDate' ? 'Issue Date: ' : 
                             dateObj.type === 'expiryDate' ? 'Expiry Date: ' : 'Date: '}
                            {dateObj.date}
                            {dateObj.calculated && ' (calculated)'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Please verify the extracted information and make corrections if needed.
                  </p>
                </div>
              }
              type="success"
              showIcon
            />
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Form.Item
            name="certificateCode"
            label="Certificate Code"
            rules={[{ required: true, message: "Please enter certificate code" }]}
          >
            <Input placeholder="Enter certificate code" />
          </Form.Item>

          <Form.Item
            name="certificateName"
            label="Certificate Name"
            rules={[{ required: true, message: "Please enter certificate name" }]}
          >
            <Input placeholder="Enter certificate name" />
          </Form.Item>

          <Form.Item
            name="issuingOrganization"
            label="Issuing Organization"
            rules={[{ required: true, message: "Please enter issuing organization" }]}
          >
            <Input placeholder="Enter issuing organization" />
          </Form.Item>

          <Space className="w-full gap-4">
            <Form.Item
              name="issueDate"
              label="Issue Date (Optional)"
              className="flex-1"
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="expirationDate"
              label="Expiration Date (Optional)"
              className="flex-1"
            >
              <DatePicker className="w-full" />
            </Form.Item>
          </Space>

          <Form.Item
            name="certificateImage"
            label="Certificate Image"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: "Please upload a certificate image" }]}
          >
            <Upload
              name="certificateImage"
              listType="picture-card"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              maxCount={1}
              customRequest={({ file, onSuccess }) => {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }}
            >
              {fileList.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div className="mt-2">Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <div className="flex gap-4 mb-4">
            <Button
              onClick={handleAnalyzeImage}
              icon={<ScanOutlined />}
              disabled={!fileList.length || analyzing}
              loading={analyzing}
            >
              Analyze Certificate
            </Button>
          </div>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              size="large"
              block
              loading={uploading}
              disabled={analyzing}
            >
              Upload Certificate
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateExCertificatePage;