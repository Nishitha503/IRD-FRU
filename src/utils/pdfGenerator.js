/**
 * Official Inland Revenue Department (IRD) Sri Lanka PDF Notice Generator
 * Generates Section 102 Compulsory Registration Notice
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateForcedRegistrationNoticePDF(record, officerName = 'Authorized Assessor / Assistant Commissioner') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const referenceNo = `IRD/FRU/${new Date().getFullYear()}/${record.id || 'REF-001'}`;

  // IRD Header Emblem & Title
  doc.setFillColor(15, 42, 74); // Deep Navy IRD Blue
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('DEPARTMENT OF INLAND REVENUE - SRI LANKA', pageWidth / 2, 11, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FORCED REGISTRATION UNIT | CENTRAL REVENUE OPERATIONS', pageWidth / 2, 17, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Sir Chittampalam A. Gardiner Mawatha, Colombo 02, Sri Lanka | Hotline: 1944 | Web: www.ird.gov.lk', pageWidth / 2, 23, { align: 'center' });

  // Notice Title Banner
  doc.setFillColor(240, 243, 248);
  doc.rect(14, 33, pageWidth - 28, 14, 'F');
  doc.setDrawColor(180, 195, 215);
  doc.rect(14, 33, pageWidth - 28, 14, 'S');

  doc.setTextColor(15, 42, 74);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('NOTICE OF COMPULSORY REGISTRATION FOR TAXATION PURPOSES', pageWidth / 2, 40, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text('(Issued under Section 102 of the Inland Revenue Act No. 24 of 2017 as amended)', pageWidth / 2, 45, { align: 'center' });

  // Metadata Grid
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`Notice Ref No: ${referenceNo}`, 14, 54);
  doc.text(`Date of Issue: ${todayStr}`, pageWidth - 14, 54, { align: 'right' });
  doc.text(`Assigned Office: ${record.regionalOffice || 'Colombo Regional Office'}`, 14, 60);
  doc.text(`Status: MANDATORY COMPLIANCE`, pageWidth - 14, 60, { align: 'right' });

  // Recipient Box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(220, 220, 220);
  doc.roundedRect(14, 65, pageWidth - 28, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('TO / RECIPIENT DETAILS:', 18, 71);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Name of Taxpayer / Entity: ${record.name || 'Unregistered Person'}`, 18, 77);
  doc.text(`National ID (NIC) / BRN: ${record.nic || record.brn || 'Not Provided / Verified'}`, 18, 83);
  doc.text(`Address: ${record.address || 'Address on Department Record'}`, 18, 89);

  // Body Text
  let startY = 100;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 42, 74);
  doc.text('STATUTORY DEMAND FOR TAX REGISTRATION', 14, startY);

  startY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);

  const introText = [
    `WHEREAS third-party statutory information obtained by the Commissioner-General of Inland Revenue (CGIR) `,
    `from sources including ${record.primaryAgency || 'Government Registrars / Financial Institutions'} indicates that you have `,
    `engaged in economic activity / transaction values aggregating to LKR ${(record.totalTurnover || 0).toLocaleString()} during the relevant Assessment Period;`,
    ``,
    `AND WHEREAS you are liable for mandatory registration with the Department of Inland Revenue but have failed to apply for registration `,
    `under Section 102 of the Inland Revenue Act No. 24 of 2017;`,
  ].join('');

  const splitIntro = doc.splitTextToSize(introText, pageWidth - 28);
  doc.text(splitIntro, 14, startY);

  startY += (splitIntro.length * 4) + 4;

  // Specific Liabilities Table
  const tableRows = [
    [
      'Taxpayer Identification Number (TIN)',
      record.hasTIN ? 'Already Active' : 'COMPULSORY REGISTRATION REQUIRED',
      record.nicDetails?.isValid ? `Individual Age ${record.nicDetails.age} Yrs / Economic Activity` : 'Economic Threshold Exceeded',
      'Section 102, IR Act 2017',
    ],
  ];

  if (record.isVatBreached) {
    tableRows.push([
      'Value Added Tax (VAT)',
      'COMPULSORY REGISTRATION REQUIRED',
      `Turnover exceeds LKR 60,000,000 Limit (Est. LKR ${record.totalTurnover.toLocaleString()})`,
      'Value Added Tax Act No. 14 of 2002',
    ]);
  }

  if (record.isSsclBreached) {
    tableRows.push([
      'Social Security Contribution Levy (SSCL)',
      'COMPULSORY REGISTRATION REQUIRED',
      `Turnover exceeds LKR 120,000,000 Limit`,
      'SSCL Act No. 25 of 2022',
    ]);
  }

  tableRows.push([
    'Estimated Potential Exposure',
    `LKR ${Math.round(record.estimatedExposure?.total || 0).toLocaleString()}`,
    'Indicative initial liability assessment based on third-party records',
    'Subject to formal return filing',
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['Tax Type / Requirement', 'Registration Requirement', 'Basis of Assessment', 'Statutory Authority']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 42, 74],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold' },
      1: { cellWidth: 48, textColor: [180, 20, 20], fontStyle: 'bold' },
      2: { cellWidth: 55 },
      3: { cellWidth: 37 },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY + 8;

  // Directives & Warning
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 30, 30);
  doc.text('DIRECTIVE FOR IMMEDIATE COMPLIANCE:', 14, finalY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  const directiveText = [
    '1. You are hereby required within FOURTEEN (14) DAYS of the date of this notice to register via the IRD e-Services Portal (www.ird.gov.lk) or report in person to the assigned Regional Office indicated above.',
    '2. Failure to register within the stipulated time will result in ex-parte Forced Registration, default tax assessments, and penalty proceedings under Chapter XVIII of the Inland Revenue Act.',
    '3. For inquiries, contact the Forced Registration Branch Help Desk or email: forcedreg@ird.gov.lk.',
  ];

  let dirY = finalY + 5;
  directiveText.forEach((line) => {
    const splitLine = doc.splitTextToSize(line, pageWidth - 28);
    doc.text(splitLine, 14, dirY);
    dirY += (splitLine.length * 3.8);
  });

  // Officer Signature Block
  const sigY = dirY + 12;
  doc.setDrawColor(180, 180, 180);
  doc.line(pageWidth - 75, sigY + 12, pageWidth - 14, sigY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text('For Commissioner General of Inland Revenue', pageWidth - 14, sigY + 16, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(officerName, pageWidth - 14, sigY + 21, { align: 'right' });
  doc.text('Forced Registration Unit | Department of Inland Revenue', pageWidth - 14, sigY + 25, { align: 'right' });

  // Official Stamp Box
  doc.rect(14, sigY, 38, 22);
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text('[ OFFICIAL STAMP / SEAL ]', 33, sigY + 12, { align: 'center' });

  // Footer bar
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 287, pageWidth, 10, 'F');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('This is an official statutory notice generated by IRD Forced Registration Master System | Powered by Novix Solutions • Ref: ' + referenceNo, pageWidth / 2, 292, { align: 'center' });

  return doc;
}

export function downloadNoticePDF(record, officerName) {
  const doc = generateForcedRegistrationNoticePDF(record, officerName);
  const fileName = `IRD_Forced_Notice_${record.nic || record.id || 'Taxpayer'}.pdf`;
  doc.save(fileName);
}
