import { useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Card,
  Typography,
  DatePicker,
  Space,
  Spin,
  Alert,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  ScanOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosInstance";
import { API } from "../../../api/apiUrl";
import axios from "axios";
import dayjs from "dayjs";
import {
  AZURE_COMPUTER_VISION_ENDPOINT,
  AZURE_COMPUTER_VISION_API_KEY,
} from "../../utils/apiConfig";

const { Title, Text } = Typography;

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
      if (
        /ielts|test report form|international english language testing system/i.test(
          line
        )
      ) {
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

    // Check if it's a high school diploma (GIAY CHUNG NHAN TOT NGHIEP THPT)
    for (const line of textLines) {
      if (
        /giấy chứng nhận tốt nghiệp thpt|giay chung nhan tot nghiep thpt/i.test(
          line
        )
      ) {
        return "High School Diploma";
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
          if (match2) return match2[0].replace(/(.{4})(?=.)/g, "$1 "); // Chia thành nhóm 4 số

          // Lấy tất cả số trong dòng này
          const allDigits = line.match(/\d+/g);
          if (allDigits && allDigits.join("").length >= 16) {
            return allDigits
              .join("")
              .substring(0, 16)
              .replace(/(.{4})(?=.)/g, "$1 ");
          }
        }
      }

      // Tìm bất kỳ dãy 16 chữ số nào trong văn bản
      for (const line of textLines) {
        const match = line.match(/\d{16}/);
        if (match) return match[0].replace(/(.{4})(?=.)/g, "$1 ");

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
        /số\s*([0-9]{8,})/i, // Số GPLX thường có 8+ chữ số
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
      /\b([A-Z][A-Z0-9]{5,})\b/, // Chữ in hoa và số, ít nhất 6 ký tự
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

    // Special handling for High School Diploma
    if (certificateName === "High School Diploma") {
      // Look for "So bao danh:" pattern specifically
      for (const line of textLines) {
        const soBaoDanhMatch = line.match(
          /s[oố]\s*b[aá]o\s*danh\s*:?\s*(\d+)/i
        );
        if (soBaoDanhMatch && soBaoDanhMatch[1]) {
          return soBaoDanhMatch[1]; // Extract the number after "So bao danh:"
        }
      }

      // Look for "SBD:" pattern (common abbreviation)
      for (const line of textLines) {
        const sbdMatch = line.match(/sbd\s*:?\s*(\d+)/i);
        if (sbdMatch && sbdMatch[1]) {
          return sbdMatch[1];
        }
      }

      // Look for any 8 digit number in text (typical format for "So bao danh")
      for (const line of textLines) {
        const match = line.match(/\b(\d{8})\b/);
        if (match) return match[1]; // Already numeric
      }

      // Extract any numeric code with at least 5 digits
      for (const line of textLines) {
        // Match any sequence of digits
        const match = line.match(/\b(\d{5,})\b/);
        if (match) {
          return match[1];
        }
      }

      // If a code was found but it's not numeric, return null
      return null;
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
        if (
          /IIBC|institute for international business communication/i.test(line)
        ) {
          return "IIBC (Institute for International Business Communication)";
        }
      }

      return "ETS (Educational Testing Service)";
    }

    // Xử lý riêng cho IELTS
    if (certificateName === "IELTS Certificate") {
      // Kiểm tra các tổ chức cấp IELTS phổ biến
      for (const line of textLines) {
        if (
          /british council|idp|cambridge assessment|cambridge english/i.test(
            line
          )
        ) {
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

    // Special handling for High School Diploma
    if (certificateName === "High School Diploma") {
      for (const line of textLines) {
        if (/bộ giáo dục và đào tạo|bo giao duc va dao tao/i.test(line)) {
          return "Bộ Giáo dục và Đào tạo";
        }
      }
      return "Bộ Giáo dục và Đào tạo"; // Default issuer for high school diploma
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
      if (
        /bộ|sở|cục|department|ministry/i.test(line) &&
        line.length > 5 &&
        line.length < 50
      ) {
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
          // Hỗ trợ định dạng như "May 19, 2024" hoặc "DD/MM/YYYY"
          const monthNames = [
            "jan",
            "feb",
            "mar",
            "apr",
            "may",
            "jun",
            "jul",
            "aug",
            "sep",
            "oct",
            "nov",
            "dec",
          ];

          // Tìm định dạng tháng tên tháng ngày, năm (ví dụ: May 19, 2024)
          const dateMatch1 = line.match(
            /([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})/i
          );
          if (dateMatch1) {
            const monthName = dateMatch1[1].toLowerCase();
            const day = parseInt(dateMatch1[2], 10);
            const year = parseInt(dateMatch1[3], 10);

            const month =
              monthNames.findIndex((m) => monthName.includes(m)) + 1;

            if (month > 0) {
              issueDate = `${day}/${month}/${year}`;
            }
          } else {
            // Tìm định dạng DD Tháng YYYY (ví dụ: 19 May 2024)
            const dateMatch2 = line.match(
              /(\d{1,2})\s+([A-Za-z]{3,})\s+(\d{4})/i
            );
            if (dateMatch2) {
              const day = parseInt(dateMatch2[1], 10);
              const monthName = dateMatch2[2].toLowerCase();
              const year = parseInt(dateMatch2[3], 10);

              const month =
                monthNames.findIndex((m) => monthName.includes(m)) + 1;

              if (month > 0) {
                issueDate = `${day}/${month}/${year}`;
              }
            } else {
              // Tìm định dạng DD/MM/YYYY
              const dateMatch3 = line.match(
                /(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/
              );
              if (dateMatch3) {
                issueDate = `${dateMatch3[1]}/${dateMatch3[2]}/${dateMatch3[3]}`;
              }
            }
          }

          if (issueDate) {
            break;
          }
        }
      }

      // Thử tìm theo các mẫu TOEFL phổ biến
      if (!issueDate) {
        for (const line of textLines) {
          // Tìm các mẫu ngày TOEFL phổ biến
          if (/test date|test taker score report/i.test(line)) {
            // Tìm định dạng tháng tên tháng ngày, năm (ví dụ: May 19, 2024)
            const monthNames = [
              "jan",
              "feb",
              "mar",
              "apr",
              "may",
              "jun",
              "jul",
              "aug",
              "sep",
              "oct",
              "nov",
              "dec",
            ];
            const dateMatch = line.match(
              /([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})/i
            );

            if (dateMatch) {
              const monthName = dateMatch[1].toLowerCase();
              const day = parseInt(dateMatch[2], 10);
              const year = parseInt(dateMatch[3], 10);

              const month =
                monthNames.findIndex((m) => monthName.includes(m)) + 1;

              if (month > 0) {
                issueDate = `${day}/${month}/${year}`;
                break;
              }
            }
          }
        }
      }

      // Nếu vẫn không tìm được, tìm kiếm tất cả các dòng
      if (!issueDate) {
        const monthNames = [
          "jan",
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ];

        for (const line of textLines) {
          // Tìm định dạng tháng tên tháng ngày, năm (ví dụ: May 19, 2024)
          const dateMatch = line.match(
            /([A-Za-z]{3,})\s+(\d{1,2}),?\s+(\d{4})/i
          );

          if (dateMatch) {
            const monthName = dateMatch[1].toLowerCase();
            const day = parseInt(dateMatch[2], 10);
            const year = parseInt(dateMatch[3], 10);

            const month =
              monthNames.findIndex((m) => monthName.includes(m)) + 1;

            if (month > 0) {
              issueDate = `${day}/${month}/${year}`;
              break;
            }
          }
        }
      }

      // Nếu tìm được ngày cấp, thêm vào danh sách
      if (issueDate) {
        dates.push({
          type: "issueDate",
          date: issueDate,
          priority: 10,
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
              type: "expiryDate",
              date: `${day2}/${month2}/${year2}`,
              priority: 10,
              calculated: true,
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
          const dateMatches = [
            ...line.matchAll(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g),
          ];
          for (const match of dateMatches) {
            allDates.push({
              day: parseInt(match[1], 10),
              month: parseInt(match[2], 10) - 1,
              year: parseInt(match[3], 10),
              date: new Date(
                parseInt(match[3], 10),
                parseInt(match[2], 10) - 1,
                parseInt(match[1], 10)
              ),
            });
          }

          // Tìm định dạng "DD Month YYYY"
          const monthPatterns = [
            /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/gi,
            /(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/gi,
          ];

          for (const pattern of monthPatterns) {
            const dateMatches = [...line.matchAll(pattern)];
            for (const match of dateMatches) {
              const monthName = match[2].toLowerCase().substring(0, 3);
              const monthIndex = [
                "jan",
                "feb",
                "mar",
                "apr",
                "may",
                "jun",
                "jul",
                "aug",
                "sep",
                "oct",
                "nov",
                "dec",
              ].indexOf(monthName);

              if (monthIndex !== -1) {
                allDates.push({
                  day: parseInt(match[1], 10),
                  month: monthIndex,
                  year: parseInt(match[3], 10),
                  date: new Date(
                    parseInt(match[3], 10),
                    monthIndex,
                    parseInt(match[1], 10)
                  ),
                });
              }
            }
          }

          // Tìm định dạng "Month DD, YYYY"
          const monthFirstPattern =
            /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/gi;
          const dateMatches2 = [...line.matchAll(monthFirstPattern)];
          for (const match of dateMatches2) {
            const monthName = match[1].toLowerCase().substring(0, 3);
            const monthIndex = [
              "jan",
              "feb",
              "mar",
              "apr",
              "may",
              "jun",
              "jul",
              "aug",
              "sep",
              "oct",
              "nov",
              "dec",
            ].indexOf(monthName);

            if (monthIndex !== -1) {
              allDates.push({
                day: parseInt(match[2], 10),
                month: monthIndex,
                year: parseInt(match[3], 10),
                date: new Date(
                  parseInt(match[3], 10),
                  monthIndex,
                  parseInt(match[2], 10)
                ),
              });
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
            type: "issueDate",
            date: `${issueDateObj.day}/${issueDateObj.month + 1}/${
              issueDateObj.year
            }`,
            priority: 8,
          });

          // Tính ngày hết hạn
          const expiryDate = new Date(
            issueDateObj.year + 2,
            issueDateObj.month,
            issueDateObj.day
          );
          dates.push({
            type: "expiryDate",
            date: `${expiryDate.getDate()}/${
              expiryDate.getMonth() + 1
            }/${expiryDate.getFullYear()}`,
            priority: 8,
            calculated: true,
          });
        }
      }

      return dates;
    }

    // Xử lý riêng cho TOEIC
    if (certificateName === "TOEIC Certificate") {
      // TOEIC thường có Test Date và Valid Until trong định dạng YYYY/MM/DD hoặc các định dạng khác
      let testDate = null;
      let validUntil = null;

      // Tìm Test Date và Valid Until
      for (const line of textLines) {
        // Tìm định dạng YYYY/MM/DD
        const yyyymmddMatches = [
          ...line.matchAll(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/g),
        ];

        if (yyyymmddMatches.length > 0) {
          // Nếu tìm thấy 2 ngày trong cùng một dòng, giả định đó là ngày cấp và ngày hết hạn
          if (yyyymmddMatches.length >= 2) {
            const first = yyyymmddMatches[0];
            const second = yyyymmddMatches[1];

            // Chuyển đổi sang định dạng DD/MM/YYYY
            testDate = `${first[3]}/${first[2]}/${first[1]}`;
            validUntil = `${second[3]}/${second[2]}/${second[1]}`;
            break;
          } else if (/test date|test/i.test(line)) {
            const match = yyyymmddMatches[0];
            testDate = `${match[3]}/${match[2]}/${match[1]}`;
          } else if (/valid until|valid/i.test(line)) {
            const match = yyyymmddMatches[0];
            validUntil = `${match[3]}/${match[2]}/${match[1]}`;
          }
        }

        // Kiểm tra các trường khác
        if (line.toLowerCase().includes("test date") && !testDate) {
          const match = line.match(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
          if (match) {
            testDate = `${match[3]}/${match[2]}/${match[1]}`;
          }
        }

        if (
          (line.toLowerCase().includes("valid until") ||
            line.toLowerCase().includes("valid to")) &&
          !validUntil
        ) {
          const match = line.match(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/);
          if (match) {
            validUntil = `${match[3]}/${match[2]}/${match[1]}`;
          }
        }
      }

      // Nếu vẫn không tìm được, kiểm tra tất cả các ngày trong định dạng YYYY/MM/DD
      if (!testDate || !validUntil) {
        const allDates = [];

        for (const line of textLines) {
          const yyyymmddMatches = [
            ...line.matchAll(/(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})/g),
          ];

          for (const match of yyyymmddMatches) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const day = parseInt(match[3], 10);

            if (
              year >= 2000 &&
              month >= 0 &&
              month <= 11 &&
              day >= 1 &&
              day <= 31
            ) {
              allDates.push({
                date: new Date(year, month, day),
                formattedDate: `${day}/${month + 1}/${year}`,
                original: `${match[1]}/${match[2]}/${match[3]}`,
              });
            }
          }
        }

        // Sắp xếp ngày theo thứ tự tăng dần
        allDates.sort((a, b) => a.date - b.date);

        // Nếu có nhiều hơn 1 ngày, lấy ngày đầu tiên làm test date và ngày thứ hai làm valid until
        if (allDates.length >= 2) {
          if (!testDate) {
            testDate = allDates[0].formattedDate;
          }

          if (!validUntil) {
            validUntil = allDates[1].formattedDate;
          }
        } else if (allDates.length === 1 && !testDate) {
          testDate = allDates[0].formattedDate;
        }
      }

      // Thêm ngày cấp vào danh sách
      if (testDate) {
        dates.push({
          type: "issueDate",
          date: testDate,
          priority: 10,
        });
      }

      // Thêm ngày hết hạn vào danh sách
      if (validUntil) {
        dates.push({
          type: "expiryDate",
          date: validUntil,
          priority: 10,
        });
      } else if (testDate) {
        // Nếu không tìm thấy ngày hết hạn nhưng có ngày cấp, tự động tính ngày hết hạn
        try {
          const parts = testDate.split(/[\/\.-]/);
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const year = parseInt(parts[2], 10) + 2; // Cộng thêm 2 năm

            const expiryDate = new Date(year, month, day);
            const day2 = expiryDate.getDate();
            const month2 = expiryDate.getMonth() + 1;
            const year2 = expiryDate.getFullYear();

            dates.push({
              type: "expiryDate",
              date: `${day2}/${month2}/${year2}`,
              priority: 9,
              calculated: true,
            });
          }
        } catch (e) {
          console.error("Error calculating TOEIC expiry date:", e);
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
        let dateMatches = [
          ...line.matchAll(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/g),
        ];
        // Hoặc định dạng như 18/FEB/2023 phổ biến trong IELTS
        const altMatches = [
          ...line.matchAll(/(\d{1,2})\/([A-Za-z]{3})\/(\d{4})/g),
        ];

        if (dateMatches.length > 0) {
          for (const match of dateMatches) {
            allFoundDates.push({
              day: parseInt(match[1], 10),
              month: parseInt(match[2], 10) - 1,
              year: parseInt(match[3], 10),
              text: `${match[1]}/${match[2]}/${match[3]}`,
            });
          }
        }

        if (altMatches.length > 0) {
          const monthMap = {
            JAN: 0,
            FEB: 1,
            MAR: 2,
            APR: 3,
            MAY: 4,
            JUN: 5,
            JUL: 6,
            AUG: 7,
            SEP: 8,
            OCT: 9,
            NOV: 10,
            DEC: 11,
          };

          for (const match of altMatches) {
            const monthStr = match[2].toUpperCase();
            if (monthMap[monthStr] !== undefined) {
              allFoundDates.push({
                day: parseInt(match[1], 10),
                month: monthMap[monthStr],
                year: parseInt(match[3], 10),
                text: `${match[1]}/${match[2]}/${match[3]}`,
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

      // Lấy ngày mới nhất làm ngày cấp (thường là ngày có điểm, không phải ngày thi)
      if (allFoundDates.length > 0) {
        const latestDate = allFoundDates[0]; // Ngày mới nhất

        dates.push({
          type: "issueDate",
          date: `${latestDate.day}/${latestDate.month + 1}/${latestDate.year}`,
          priority: 10,
        });

        // Tự động thêm ngày hết hạn 2 năm sau ngày cấp (tất cả chứng chỉ IELTS có hạn 2 năm)
        try {
          const expiryDate = new Date(
            latestDate.year + 2,
            latestDate.month,
            latestDate.day
          );
          const day2 = expiryDate.getDate();
          const month2 = expiryDate.getMonth() + 1;
          const year2 = expiryDate.getFullYear();

          dates.push({
            type: "expiryDate",
            date: `${day2}/${month2}/${year2}`,
            priority: 9,
            calculated: true,
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
      let dateOfBirth = null;

      // Tìm ngày sinh trước để đảm bảo không nhầm lẫn
      for (const line of textLines) {
        if (/date of birth|ngày sinh/i.test(line)) {
          const match = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
          if (match) {
            dateOfBirth = `${match[1]}/${match[2]}/${match[3]}`;
          }
        }
      }

      const lastLines = textLines.slice(-10);

      for (const line of lastLines) {
        // TRƯỜNG HỢP ĐẶC BIỆT: Xử lý mẫu "TP. Ho Chi Minh, ngay/date 2 1 thang/month 01 nåm/year 2022"
        if (
          (line.includes("ngay/date") &&
            line.includes("thang/month") &&
            line.includes("nam/year")) ||
          (line.includes("ngay/date") &&
            line.includes("thang/month") &&
            line.includes("nåm/year"))
        ) {
          // Trường hợp số ngày bị tách (vd: "2 1" thay vì "21")
          let day = null;
          let month = null;
          let year = null;

          // Tìm số ngày (có thể bị tách)
          const dayPattern = /ngay\/date\s*(\d+)\s*(\d*)/i;
          const dayMatch = line.match(dayPattern);
          if (dayMatch) {
            // Nếu có 2 số liên tiếp sau "ngay/date"
            if (dayMatch[1] && dayMatch[2]) {
              day = parseInt(dayMatch[1] + dayMatch[2], 10);
            } else if (dayMatch[1]) {
              day = parseInt(dayMatch[1], 10);
            }
          }

          // Tìm tháng
          const monthPattern = /thang\/month\s*(\d+)/i;
          const monthMatch = line.match(monthPattern);
          if (monthMatch && monthMatch[1]) {
            month = parseInt(monthMatch[1], 10);
          }

          // Tìm năm
          const yearPattern = /n[aåă]m\/year\s*(\d{4})/i;
          const yearMatch = line.match(yearPattern);
          if (yearMatch && yearMatch[1]) {
            year = parseInt(yearMatch[1], 10);
          }

          // Nếu tìm thấy đủ ngày, tháng, năm
          if (day && month && year) {
            const issueDateStr = `${day}/${month}/${year}`;
            dates.push({
              type: "issueDate",
              date: issueDateStr,
              priority: 200, // Độ ưu tiên cao nhất
              source: "special_format_exact_match",
            });

            issueDateFound = true;
            break;
          }
        }

        // Pattern đặc biệt của bằng lái xe Việt Nam: "ngày/date X tháng/month Y năm/year Z"
        if (
          /ng[aà]y.{0,5}date.*\d+.*th[aá]ng.{0,5}month.*\d+.*n[aăå]m.{0,5}year.*\d{4}/i.test(
            line
          )
        ) {
          // Trích xuất số từ sau "ngày/date", "tháng/month", "năm/year"
          const dayMatch = line.match(/ng[aà]y.{0,5}date.*?(\d{1,2})/i);
          const monthMatch = line.match(/th[aá]ng.{0,5}month.*?(\d{1,2})/i);
          const yearMatch = line.match(/n[aăå]m.{0,5}year.*?(\d{4})/i);

          if (dayMatch && monthMatch && yearMatch) {
            const day = parseInt(dayMatch[1], 10);
            const month = parseInt(monthMatch[1], 10);
            const year = parseInt(yearMatch[1], 10);

            const issueDateStr = `${day}/${month}/${year}`;
            dates.push({
              type: "issueDate",
              date: issueDateStr,
              priority: 100, // Độ ưu tiên cao nhất
              source: "special_format",
            });

            issueDateFound = true;
            // Đã tìm thấy ngày cấp với độ chính xác cao, dừng tìm kiếm
            break;
          }
        }
      }

      // Nếu không tìm thấy trong các dòng cuối, tìm trong toàn bộ văn bản
      if (!issueDateFound) {
        for (const line of textLines) {
          if (
            /ngày.{0,5}date.*\d+.*tháng.{0,5}month.*\d+.*năm.{0,5}year.*\d{4}/i.test(
              line
            )
          ) {
            // Trích xuất số từ sau "ngày/date", "tháng/month", "năm/year"
            const dayMatch = line.match(/ngày.{0,5}date.*?(\d{1,2})/i);
            const monthMatch = line.match(/tháng.{0,5}month.*?(\d{1,2})/i);
            const yearMatch = line.match(/năm.{0,5}year.*?(\d{4})/i);

            if (dayMatch && monthMatch && yearMatch) {
              const day = parseInt(dayMatch[1], 10);
              const month = parseInt(monthMatch[1], 10);
              const year = parseInt(yearMatch[1], 10);

              const issueDateStr = `${day}/${month}/${year}`;
              // Thêm ngày cấp vào danh sách với độ ưu tiên cao
              dates.push({
                type: "issueDate",
                date: issueDateStr,
                priority: 95, // Độ ưu tiên cao
                source: "special_format",
              });

              issueDateFound = true;
              break;
            }
          }
        }
      }

      // Tìm ngày hết hạn
      // ... phần code tìm ngày hết hạn giữ nguyên ...
      for (const line of textLines) {
        if (
          /có giá trị đến|expires|valid until|expiry date|expiration date|valid to/i.test(
            line
          )
        ) {
          // Kiểm tra nếu là không thời hạn
          if (/không thời hạn|no expiration/i.test(line)) {
            dates.push({
              type: "expiryDate",
              date: "Không thời hạn",
              priority: 10,
            });
            expiryDateFound = true;
          } else {
            // Tìm định dạng ngày DD/MM/YYYY
            const match = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (match) {
              dates.push({
                type: "expiryDate",
                date: `${match[1]}/${match[2]}/${match[3]}`,
                priority: 10,
              });
              expiryDateFound = true;
            }
          }
        }
      }

      // Tìm ngày cấp theo cách khác nếu chưa tìm thấy
      if (!issueDateFound) {
        // ... phần code tìm ngày cấp khác giữ nguyên ...
        for (const line of textLines) {
          if (
            /cấp ngày|issue date|issued on|ngày\/date|date of issue/i.test(line)
          ) {
            const match = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (match) {
              // Kiểm tra nếu đây không phải là ngày sinh
              if (
                !dateOfBirth ||
                dateOfBirth !== `${match[1]}/${match[2]}/${match[3]}`
              ) {
                dates.push({
                  type: "issueDate",
                  date: `${match[1]}/${match[2]}/${match[3]}`,
                  priority: 10,
                });
                issueDateFound = true;
              }
            }
          }
        }
      }

      // QUAN TRỌNG: Sắp xếp lại danh sách ngày theo độ ưu tiên trước khi trả về
      dates.sort((a, b) => (b.priority || 0) - (a.priority || 0));

      return dates;
    }

    // Xử lý chung cho các loại chứng chỉ - tìm ngày ở cuối trang
    // Tập trung vào 7 dòng cuối cùng
    const lastLines = textLines.slice(-7);

    // Tìm dòng có chữ "Date" ở cuối trang
    let dateLineFound = false;
    for (const line of lastLines) {
      if (
        /^date\s*$/i.test(line) ||
        /^date[: ]/i.test(line) ||
        line.trim().toLowerCase() === "date"
      ) {
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
            type: "issueDate",
            date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
            priority: 10,
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
              type: "expiryDate",
              date: `${day2}/${month2}/${year2}`,
              priority: 9,
              calculated: true,
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
    if (!dates.some((d) => d.type === "issueDate")) {
      for (const line of lastLines) {
        // Tìm định dạng ngày DD/MM/YYYY ở dòng cuối
        const dateMatch = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
        if (dateMatch) {
          dates.push({
            type: "issueDate",
            date: `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`,
            priority: 8,
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
              type: "expiryDate",
              date: `${day2}/${month2}/${year2}`,
              priority: 7,
              calculated: true,
            });
          } catch (e) {
            console.error("Error calculating expiry date:", e);
          }

          break;
        }
      }
    }

    // Giấy phép lái xe - tìm ngày ở góc dưới bên phải
    if (
      certificateName === "Driver License" &&
      !dates.some((d) => d.type === "issueDate")
    ) {
      // Mẫu định dạng ngày tháng năm Việt Nam ở góc phải dưới
      const vietnameseDatePattern =
        /ngày\/date\s*(\d{1,2})\s*tháng\/month\s*(\d{1,2})\s*năm\/year\s*(\d{4})/i;

      // Pattern mở rộng để bắt nhiều định dạng hơn
      const vietnameseDatePatternGeneral =
        /ng[aà]y.{0,5}date.*?(\d{1,2}).*?th[aá]ng.{0,5}month.*?(\d{1,2}).*?n[aăå]m.{0,5}year.*?(\d{4})/i;

      // Pattern đặc biệt cho trường hợp số ngày bị tách rời
      const splitDayPattern =
        /ng[aà]y.{0,5}date\s*(\d+)\s+(\d+)\s+th[aá]ng.{0,5}month\s*(\d{1,2})\s+n[aăå]m.{0,5}year\s*(\d{4})/i;

      // Các pattern khác
      const vietnameseDatePattern2 =
        /ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i;
      const vietnameseDatePattern3 =
        /(\d{1,2})\s*tháng\s*(\d{1,2})\s*năm\s*(\d{4})/i;

      // Xác định ngày sinh để không nhầm lẫn
      let dateOfBirth = null;
      for (const line of textLines) {
        if (/date of birth|ngày sinh/i.test(line)) {
          const match = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
          if (match) {
            dateOfBirth = `${match[1]}/${match[2]}/${match[3]}`;
          }
        }
      }

      for (const line of lastLines) {
        // Kiểm tra trường hợp số ngày bị tách rời
        let splitMatch = line.match(splitDayPattern);
        if (splitMatch) {
          // Ghép số ngày lại nếu bị tách (vd: "2 1" thành "21")
          const day = parseInt(splitMatch[1] + splitMatch[2], 10);
          const month = parseInt(splitMatch[3], 10);
          const year = parseInt(splitMatch[4], 10);

          const issueDate = `${day}/${month}/${year}`;

          // Kiểm tra nếu không phải ngày sinh
          if (!dateOfBirth || issueDate !== dateOfBirth) {
            dates.push({
              type: "issueDate",
              date: issueDate,
              priority: 150,
              source: "split_day_pattern",
            });
          }
          continue;
        }

        // Kiểm tra pattern mở rộng trước
        let match = line.match(vietnameseDatePatternGeneral);
        if (match) {
          const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
          // Kiểm tra nếu không phải ngày sinh
          if (!dateOfBirth || issueDate !== dateOfBirth) {
            dates.push({
              type: "issueDate",
              date: issueDate,
              priority: 100,
              source: "special_pattern",
            });
          }
          continue;
        }

        // Tiếp tục với các pattern khác
        match = line.match(vietnameseDatePattern);
        if (match) {
          const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
          // Kiểm tra nếu không phải ngày sinh
          if (!dateOfBirth || issueDate !== dateOfBirth) {
            dates.push({
              type: "issueDate",
              date: issueDate,
              priority: 10,
            });
          }
          continue;
        }

        match = line.match(vietnameseDatePattern2);
        if (match) {
          const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
          // Kiểm tra nếu không phải ngày sinh
          if (!dateOfBirth || issueDate !== dateOfBirth) {
            dates.push({
              type: "issueDate",
              date: issueDate,
              priority: 9,
            });
          }
          continue;
        }

        match = line.match(vietnameseDatePattern3);
        if (match) {
          const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
          // Kiểm tra nếu không phải ngày sinh
          if (!dateOfBirth || issueDate !== dateOfBirth) {
            dates.push({
              type: "issueDate",
              date: issueDate,
              priority: 8,
            });
          }
          continue;
        }
      }

      // QUAN TRỌNG: Sắp xếp lại danh sách ngày theo độ ưu tiên
      dates.sort((a, b) => (b.priority || 0) - (a.priority || 0));
    }

    // Tìm ngày cấp trong toàn bộ văn bản nếu chưa tìm thấy
    if (!dates.some((d) => d.type === "issueDate")) {
      for (const line of textLines) {
        if (/ngày\/date|cấp ngày|issue date|issued on/i.test(line)) {
          // Tìm mẫu ngày DD/MM/YYYY hoặc ngày DD tháng MM năm YYYY
          const match = line.match(/(\d{1,2})[\/\s\.](\d{1,2})[\/\s\.](\d{4})/);
          if (match) {
            const issueDate = `${match[1]}/${match[2]}/${match[3]}`;
            dates.push({
              type: "issueDate",
              date: issueDate,
              priority: 5,
            });

            // Thêm ngày hết hạn nếu chưa có
            if (!dates.some((d) => d.type === "expiryDate")) {
              try {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1;
                const year = parseInt(match[3], 10);

                const expiryDate = new Date(year + 2, month, day);
                const day2 = expiryDate.getDate();
                const month2 = expiryDate.getMonth() + 1;
                const year2 = expiryDate.getFullYear();

                dates.push({
                  type: "expiryDate",
                  date: `${day2}/${month2}/${year2}`,
                  priority: 4,
                  calculated: true,
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
    if (!dates.some((d) => d.type === "expiryDate")) {
      for (const line of textLines) {
        if (
          /có giá trị đến|expires|valid until|expiry date|expiration date/i.test(
            line
          )
        ) {
          if (/không thời hạn|no expiration/i.test(line)) {
            dates.push({
              type: "expiryDate",
              date: "Không thời hạn",
              priority: 6,
            });
          } else {
            const match = line.match(
              /(\d{1,2})[\/\s\.](\d{1,2})[\/\s\.](\d{4})/
            );
            if (match) {
              const expiryDate = `${match[1]}/${match[2]}/${match[3]}`;
              dates.push({
                type: "expiryDate",
                date: expiryDate,
                priority: 6,
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
          if (!dates.some((d) => d.date === dateStr)) {
            dates.push({
              type: "unknown",
              date: dateStr,
              priority: 1,
            });
          }
        }
      }
    }

    // Sắp xếp ngày theo ưu tiên
    dates.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    // Thêm ngày hết hạn tự động nếu đã tìm thấy ngày cấp nhưng chưa có ngày hết hạn
    if (
      dates.some((d) => d.type === "issueDate") &&
      !dates.some((d) => d.type === "expiryDate")
    ) {
      const issueDate = dates.find((d) => d.type === "issueDate");
      // Chỉ tính ngày hết hạn tự động khi KHÔNG phải là bằng lái xe
      if (
        issueDate &&
        issueDate.date !== "Không thời hạn" &&
        certificateName !== "Driver License"
      ) {
        try {
          // Xử lý các định dạng ngày khác nhau
          let day, month, year;
          const dateParts = issueDate.date.split(/[\/\.-]/);

          if (dateParts.length === 3) {
            if (isNaN(dateParts[1])) {
              // Tháng là chữ
              const monthMap = {
                JAN: 0,
                FEB: 1,
                MAR: 2,
                APR: 3,
                MAY: 4,
                JUN: 5,
                JUL: 6,
                AUG: 7,
                SEP: 8,
                OCT: 9,
                NOV: 10,
                DEC: 11,
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
              type: "expiryDate",
              date: `${day2}/${month2}/${year2}`,
              priority: 3,
              calculated: true,
            });
          }
        } catch (e) {
          console.error("Error calculating final expiry date:", e);
        }
      }
    }

    // Special handling for High School Diploma
    if (certificateName === "High School Diploma") {
      // Look for issue date in format "ngay DD thang MM nam YYYY"
      for (const line of textLines) {
        // Check for special Vietnamese date format
        const dateMatch = line.match(
          /ngay\s+(\d{1,2})\s+th[aáà]ng\s+(\d{1,2})\s+n[aăâ]m\s+(\d{4})/i
        );
        if (dateMatch) {
          const day = parseInt(dateMatch[1], 10);
          const month = parseInt(dateMatch[2], 10);
          const year = parseInt(dateMatch[3], 10);

          dates.push({
            type: "issueDate",
            date: `${day}/${month}/${year}`,
            priority: 100,
          });

          // High school diploma doesn't have expiration date
          break;
        }
      }

      // Look for year-only dates (like "nam 2018")
      if (dates.length === 0) {
        for (const line of textLines) {
          const yearMatch = line.match(/n[aăâ]m\s+(\d{4})/i);
          if (yearMatch) {
            const year = parseInt(yearMatch[1], 10);
            // Assume issue date is July 15th of the graduation year
            dates.push({
              type: "issueDate",
              date: `15/7/${year}`,
              priority: 50,
              estimated: true,
            });
            break;
          }
        }
      }

      return dates;
    }

    return dates;
  };

  // Thêm hàm xử lý thông tin từ bằng THPT
  const extractHighSchoolDiplomaInfo = (textLines) => {
    const info = {
      certificateName: "",
      studentName: "",
      dateOfBirth: "",
      placeOfBirth: "",
      ethnicity: "",
      graduationYear: "",
      classification: "",
      registerCode: "",
      issueDate: "",
      issuePlace: "",
    };

    // Hàm hỗ trợ tìm kiếm thông tin
    const findLineContaining = (keyword, lines) => {
      return lines.find((line) =>
        line.toLowerCase().includes(keyword.toLowerCase())
      );
    };

    const findValueAfter = (keyword, line) => {
      if (!line) return "";
      const index = line.toLowerCase().indexOf(keyword.toLowerCase());
      if (index === -1) return "";
      return line.substring(index + keyword.length).trim();
    };

    // Xử lý từng dòng text
    textLines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();

      // Tên bằng
      if (lowerLine.includes("bằng tốt nghiệp")) {
        info.certificateName = "Bằng Tốt nghiệp Trung học Phổ thông";
      }

      // Họ và tên
      if (lowerLine.includes("học sinh:") || lowerLine.includes("họ và tên:")) {
        info.studentName =
          findValueAfter("học sinh:", line) ||
          findValueAfter("họ và tên:", line);
      }

      // Ngày sinh
      if (lowerLine.includes("ngày sinh:")) {
        const dateStr = findValueAfter("ngày sinh:", line);
        // Chuyển đổi định dạng ngày nếu cần
        info.dateOfBirth = dateStr;
      }

      // Nơi sinh
      if (lowerLine.includes("nơi sinh:")) {
        info.placeOfBirth = findValueAfter("nơi sinh:", line);
      }

      // Dân tộc
      if (lowerLine.includes("dân tộc:")) {
        info.ethnicity = findValueAfter("dân tộc:", line);
      }

      // Năm tốt nghiệp
      if (lowerLine.includes("năm tốt nghiệp:")) {
        info.graduationYear = findValueAfter("năm tốt nghiệp:", line);
      }

      // Xếp loại
      if (lowerLine.includes("xếp loại:")) {
        info.classification = findValueAfter("xếp loại:", line);
      }

      // Số hiệu/Mã đăng ký
      if (lowerLine.includes("số hiệu:") || lowerLine.includes("số đăng ký:")) {
        info.registerCode =
          findValueAfter("số hiệu:", line) ||
          findValueAfter("số đăng ký:", line);
      }

      // Ngày cấp
      if (
        lowerLine.includes("ngày") &&
        lowerLine.includes("tháng") &&
        lowerLine.includes("năm")
      ) {
        const dateMatch = line.match(
          /ngày\s+(\d+)\s+tháng\s+(\d+)\s+năm\s+(\d+)/i
        );
        if (dateMatch) {
          info.issueDate = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
        }
      }

      // Nơi cấp
      if (lowerLine.includes("tại")) {
        info.issuePlace = findValueAfter("tại", line);
      }
    });

    return info;
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
          "Content-Type": "application/octet-stream",
          "Ocp-Apim-Subscription-Key": AZURE_COMPUTER_VISION_API_KEY,
        },
      });

      // Lấy vị trí để kiểm tra kết quả phân tích
      const operationLocation = submitResponse.headers["operation-location"];
      if (!operationLocation) {
        throw new Error("Operation location not found in response");
      }

      // Chờ phân tích hoàn tất (với thử lại)
      let analysisResult;
      let retries = 10;

      while (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Đợi 1 giây

        const resultResponse = await axios.get(operationLocation, {
          headers: {
            "Ocp-Apim-Subscription-Key": AZURE_COMPUTER_VISION_API_KEY,
          },
        });

        if (resultResponse.data.status === "succeeded") {
          analysisResult = resultResponse.data;
          break;
        } else if (resultResponse.data.status === "failed") {
          throw new Error("Text analysis failed");
        }

        retries--;
      }

      if (!analysisResult) {
        throw new Error("Text analysis did not complete in time");
      }

      // Trích xuất văn bản từ kết quả phân tích
      const extractedText = [];
      if (
        analysisResult.analyzeResult &&
        analysisResult.analyzeResult.readResults
      ) {
        for (const page of analysisResult.analyzeResult.readResults) {
          for (const line of page.lines || []) {
            extractedText.push(line.text);
          }
        }
      }

      try {
        // Trích xuất thông tin chứng chỉ
        const possibleCertName = extractCertificateName(extractedText);
        const possibleCode = extractPossibleCertificateCode(extractedText);
        const possibleIssuer = extractPossibleIssuer(extractedText);

        // Log chi tiết về việc tìm ngày sinh
        for (const line of extractedText) {
          if (/date of birth|ngày sinh/i.test(line)) {
            const match = line.match(/(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})/);
            if (match) {
            }
          }
        }

        const possibleDates = extractPossibleDates(extractedText);

        const certificateInfo = {
          text: extractedText.join("\n"),
          possibleCode: possibleCode,
          possibleCertName: possibleCertName,
          possibleIssuer: possibleIssuer,
          possibleDates: possibleDates,
        };

        // Kiểm tra xem có phải là chứng chỉ/giấy phép hợp lệ không
        const isCertificateOrLicense =
          possibleCertName !== null || // Đã nhận dạng được tên chứng chỉ cụ thể
          (possibleCode !== null && possibleDates.length > 0) || // Có mã số và ngày tháng
          /certificate|chứng chỉ|diploma|bằng|license|giấy phép|ielts|toefl|toeic/i.test(
            extractedText.join(" ")
          );

        if (!isCertificateOrLicense) {
          throw new Error(
            "Cannot detect certificate or license in the image. Please upload a valid certificate image."
          );
        }

        // Tạo hàm trợ giúp để chuyển đổi chuỗi ngày sang đối tượng moment
        const convertToMoment = (dateString) => {
          try {
            // Kiểm tra xem chuỗi ngày có chứa chữ cái không (ví dụ: FEB)
            if (/[A-Za-z]/.test(dateString)) {
              const parts = dateString.split(/[\/\.-]/);
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const monthStr = parts[1].toUpperCase();
                const year = parseInt(parts[2], 10);

                const monthMap = {
                  JAN: 0,
                  FEB: 1,
                  MAR: 2,
                  APR: 3,
                  MAY: 4,
                  JUN: 5,
                  JUL: 6,
                  AUG: 7,
                  SEP: 8,
                  OCT: 9,
                  NOV: 10,
                  DEC: 11,
                };

                if (monthMap[monthStr.toUpperCase()] !== undefined) {
                  // Tạo đối tượng dayjs (tương thích với Ant Design)
                  const date = dayjs()
                    .year(year)
                    .month(monthMap[monthStr.toUpperCase()])
                    .date(day);
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
          // For High School Diploma, ensure code is numeric
          if (certificateInfo.possibleCertName === "High School Diploma") {
            // If code isn't all digits, try to extract only digits
            if (!/^\d+$/.test(certificateInfo.possibleCode)) {
              const numericCode = certificateInfo.possibleCode.replace(
                /\D/g,
                ""
              );
              if (numericCode.length > 0) {
                form.setFieldsValue({ certificateCode: numericCode });
              }
            } else {
              form.setFieldsValue({
                certificateCode: certificateInfo.possibleCode,
              });
            }
          } else {
            form.setFieldsValue({
              certificateCode: certificateInfo.possibleCode,
            });
          }
        }

        if (certificateInfo.possibleCertName) {
          form.setFieldsValue({
            certificateName: certificateInfo.possibleCertName,
          });
        }

        if (certificateInfo.possibleIssuer) {
          form.setFieldsValue({
            issuingOrganization: certificateInfo.possibleIssuer,
          });
        }

        // Xử lý ngày tháng
        const issueDates = possibleDates.filter((d) => d.type === "issueDate");
        const expiryDates = possibleDates.filter(
          (d) => d.type === "expiryDate"
        );

        // Thiết lập ngày cấp
        if (issueDates.length > 0) {
          const issueDate = issueDates[0].date;
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
          setTimeout(() => {}, 1500);
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
              certificateCode: `${certificateInfo.possibleCode} (Overall: ${overallBandScore})`,
            });
          }
        }

        setAnalysisResult({
          fileUrl: URL.createObjectURL(file),
          analysis: certificateInfo,
          completed: true,
        });

        message.success("Analyzed successfully!");

        return certificateInfo;
      } catch (error) {
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
      message.error("Analyze failed: " + (error.message || "Undetected Error"));

      // Reset trạng thái phân tích và kết quả
      setAnalysisResult(null);
      form.resetFields();

      throw error;
    }
  };

  // Xử lý phân tích ảnh
  const handleAnalyzeImage = async () => {
    if (!fileList.length) {
      message.error("Please upload the image!");
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
      message.error(error.message || "Cannot analyze image,Please try again.");

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
      formData.append(
        "CertificateImage",
        values.certificateImage[0].originFileObj
      );
    }

    try {
      await axiosInstance.post(API.CREATE_EXTERNAL_CERTIFICATE, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      message.success("Certificate uploaded successfully!");
      navigate(`/candidates/${candidateId}`);
    } catch (error) {
      message.error("Failed to upload certificate.");
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("You can only upload image files!");
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("Image must be smaller than 5MB!");
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
                  <span>
                    We're analyzing your certificate to extract information
                    automatically...
                  </span>
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
                    <p>
                      <strong>Detected Certificate Code:</strong>{" "}
                      {analysisResult.analysis.possibleCode}
                    </p>
                  )}
                  {analysisResult.analysis.possibleCertName && (
                    <p>
                      <strong>Detected Certificate Name:</strong>{" "}
                      {analysisResult.analysis.possibleCertName}
                    </p>
                  )}
                  {analysisResult.analysis.possibleIssuer && (
                    <p>
                      <strong>Detected Issuing Organization:</strong>{" "}
                      {analysisResult.analysis.possibleIssuer}
                    </p>
                  )}
                  {analysisResult.analysis.possibleDates &&
                    analysisResult.analysis.possibleDates.length > 0 && (
                      <div>
                        <p>
                          <strong>Detected Dates:</strong>
                        </p>
                        <ul className="pl-5">
                          {analysisResult.analysis.possibleDates
                            .filter(
                              (dateObj) =>
                                dateObj.type === "issueDate" ||
                                dateObj.type === "expiryDate"
                            )
                            .map((dateObj, index) => (
                              <li key={index}>
                                {dateObj.type === "issueDate"
                                  ? "Issue Date: "
                                  : dateObj.type === "expiryDate"
                                  ? "Expiry Date: "
                                  : ""}
                                {dateObj.date}
                                {dateObj.calculated && " (calculated)"}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  <p className="mt-2 text-xs text-gray-500">
                    Please verify the extracted information and make corrections
                    if needed.
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
            rules={[
              { required: true, message: "Please enter certificate code" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const certName = getFieldValue("certificateName");
                  if (certName === "High School Diploma" && value) {
                    // Check if value is numeric for High School Diploma
                    if (!/^\d+$/.test(value)) {
                      return Promise.reject(
                        "Certificate code must be a number for High School Diploma"
                      );
                    }
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <Input placeholder="Enter certificate code" />
          </Form.Item>

          <Form.Item
            name="certificateName"
            label="Certificate Name"
            rules={[
              { required: true, message: "Please enter certificate name" },
            ]}
          >
            <Input placeholder="Enter certificate name" />
          </Form.Item>

          <Form.Item
            name="issuingOrganization"
            label="Issuing Organization"
            rules={[
              { required: true, message: "Please enter issuing organization" },
            ]}
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
            rules={[
              { required: true, message: "Please upload a certificate image" },
            ]}
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
