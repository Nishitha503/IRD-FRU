# Inland Revenue Department (IRD) Sri Lanka - Forced Registration Master System
### දේශීය ආදායම් දෙපාර්තමේන්තුව - බලයලත් ලියාපදිංචි කිරීමේ ඒකකය

This application is designed specifically for the **Forced Registration Unit (FRU)** of the **Department of Inland Revenue Sri Lanka**, enabling officers to import raw third-party Excel/CSV data, perform automated validation, detect deduplicated entities, evaluate statutory tax thresholds (TIN, VAT, SSCL), allocate regional offices, and generate the final **Multi-Tab Master File (.xlsx)** and **Section 102 Statutory Notices (PDF)**.

---

## 🌟 Key Features & Capabilities (ප්‍රධාන පහසුකම්)

1. **Multi-Source Excel/CSV Upload (ඕනෑම Excel / CSV ගොනුවක් ඇතුලත් කිරීම)**:
   - Drag & drop `.xlsx`, `.xls`, or `.csv` files.
   - Multi-sheet support with automatic row and column detection.
   - 1-Click pre-loaded Sri Lankan datasets (Customs Imports, DMT Luxury Vehicles, Financial Institutions).

2. **Intelligent Dynamic Column Mapping (ස්වයංක්‍රීය තීරු ගැලපීම)**:
   - Auto-detects columns for NIC, BRN, TIN, Taxpayer Name, Address, Turnover/CIF Value, Phone, Email, and Source Agency.
   - Supports Sinhala & English column headers.

3. **Sri Lankan NIC Validator & Parser (ජාතික හැඳුනුම්පත් විශ්ලේෂණය)**:
   - Validates **Old 9-digit (with V/X)** and **New 12-digit** formats.
   - Automatically calculates **Date of Birth**, **Gender**, **Age**, and cross-format conversion.
   - Flags format errors (e.g. invalid day of year, incorrect check characters) for field verification.

4. **Entity Consolidation & Duplicate Merging (දත්ත ඒකාබද්ධ කිරීම)**:
   - Groups multiple transactions under the same NIC/BRN/TIN into a single unified taxpayer profile while preserving individual transaction history.
   - Aggregates total turnover and transaction counts.

5. **Statutory Tax Rule Engine & Risk Scoring (බදු නීති රීති හා අවදානම් මට්ටම්)**:
   - **Mandatory TIN Rule**: Evaluates citizens reaching age threshold (18+) or exceeding income limits without an active TIN.
   - **VAT Threshold Breach**: Flags entities with annual turnover $\ge$ LKR 60,000,000 liable for 18% VAT.
   - **SSCL Threshold Breach**: Flags entities with turnover $\ge$ LKR 120,000,000 liable for 2.5% SSCL.
   - **Risk Priority Scoring (0–100)**: Categorizes into Critical, High, Medium, and Low risk.
   - **Estimated Potential Tax Exposure**: Calculates indicative revenue yield based on statutory tax brackets.

6. **Automated IRD Regional Office Allocation (ප්‍රාදේශීය කාර්යාල වෙන් කිරීම)**:
   - Automatically assigns cases to Sri Lankan IRD Regional Offices (Metro Corporate, Colombo Central, Kandy, Galle, Gampaha, Kurunegala, Kalutara, etc.) based on address keywords.

7. **Multi-Tab Master File Export (.xlsx) (අවසන් Master ගොනුව බාගත කිරීම)**:
   - **Tab 1: Master Registration List** (Full standardized dataset with DOB, Gender, Age, NIC Status, Exposure).
   - **Tab 2: Actionable Forced Notices** (Prioritized high-risk list for immediate Section 102 notices).
   - **Tab 3: VAT & SSCL Breaches** (Entities liable for commercial turnover taxes).
   - **Tab 4: Data Exceptions & Invalid NICs** (Records requiring physical field verification).
   - **Tab 5: Executive Statistics** (Aggregated metrics, turnover sums, and regional counts).

8. **Section 102 Statutory Notice PDF Generator (නිල බලයලත් ලියාපදිංචි නිවේදන)**:
   - Generates official Inland Revenue Department Sri Lanka "Notice of Compulsory Registration under Section 102 of the Inland Revenue Act No. 24 of 2017".

9. **100% Client-Side Privacy & Offline Security (දත්තවල පූර්ණ රහස්‍යභාවය)**:
   - All Excel processing and calculations occur strictly inside your local browser.
   - **Zero government data is sent over the internet**.

---

## 🚀 How to Run the System (භාවිතා කරන ආකාරය)

### Option 1: Double-Click Launcher (Windows)
Double-click the file [`run_ird_system.bat`](file:///c:/Users/Intel/Desktop/IRD/run_ird_system.bat) in this folder. It will start the server and open your browser automatically.

### Option 2: Command Line
```bash
npm run dev
```
Then open your web browser and go to `http://localhost:5173/`.
