===================================================================================
ශ්‍රී ලංකා දේශීය ආදායම් දෙපාර්තමේන්තුව - බලයලත් ලියාපදිංචි කිරීමේ ඒකකය (FRU)
DEPARTMENT OF INLAND REVENUE - SRI LANKA | FORCED REGISTRATION UNIT
RAMIS INTRANET / AIR-GAPPED WORKSTATION USER GUIDE (OFFLINE DEPLOYMENT)
===================================================================================

[සිංහල උපදෙස්]
ඔබගේ කාර්යාල පරිගණකය (Office PC) RAMIS පද්ධතියට පමණක් සම්බන්ධ වී ඇති බැවින් සහ 
බාහිර අන්තර්ජාලය (Public Internet) නොමැති බැවින්, මෙම පද්ධතිය 100% ක් සම්පූර්ණයෙන්ම 
Offline ලෙස ක්‍රියාත්මක වන පරිදි මෙහි සකස් කර ඇත.

Node.js හෝ වෙනත් කිසිදු Software එකක් Install කිරීම අවශ්‍ය නොවේ.

පද්ධතිය කාර්යාල පරිගණකයට දමා ධාවනය කරන ආකාරය:
-----------------------------------------------------------------------------------
1. ඔබගේ Pendrive (USB Flash Drive) එකට මෙම සම්පූර්ණ "IRD_OFFLINE_PACKAGE" Folder එක 
   Copy කරගන්න.

2. කාර්යාල පරිගණකයට (Office PC) Pendrive එක ගසා, මෙම "IRD_OFFLINE_PACKAGE" Folder එක 
   කාර්යාල පරිගණකයේ Desktop එකට Paste කරන්න.

3. Folder එක ඇතුළට ගොස් "START_IRD_FRU.bat" මත Double-Click කරන්න.
   - එවිට කුඩා කළු Command Window එකක් විවෘත වී, තත්පර 2-3 කින් Google Chrome හෝ 
     Microsoft Edge Browser එකෙන් පද්ධතිය ස්වයංක්‍රීයව විවෘත වේ (http://localhost:5173).
   - ඔබ පද්ධතිය භාවිතා කරන තුරු එම කළු Command Window එක Close නොකර තබා ගන්න.

4. පළමු වරට පද්ධතියට ඇතුළු වීම (First Time Sign-In):
   - පළමු වරට කාර්යාල පරිගණකයේ Login Screen එකේදී "🔒 RAMIS Intranet (100% Offline)" 
     තෝරා ඇති බව පෙනෙනු ඇත.
   - "Register Officer" Tab එකට ගොස් ඔබගේ නම, Staff / Service ID එක සහ ඔබ කැමති 
     Password එකක් ඇතුළත් කර "Register Officer & Access System" ක්ලික් කරන්න.
   - එම පරිශීලක ගිණුම එම කාර්යාල පරිගණකයේ ආරක්ෂිත Local Storage එකෙහි තැන්පත් වේ.
   - ඉන්පසු සෑම දිනකම එම Username / Password යොදා සුපුරුදු පරිදි Login විය හැක.

5. RAMIS හා Excel දත්ත විගණනය:
   - RAMIS එකෙන් හෝ අනෙකුත් රාජ්‍ය ආයතනවලින් (Customs, Banks, Land Registry) ලබාගත් 
     Excel ගොනු කිහිපයක් වුවද එකවර Upload කර ක්ෂණිකව Analysis එක ලබාගත හැක.
   - TIN අංකය මඟින් පසුගිය මාස 6 ක දත්ත විමර්ශනය කර PDF හා Excel වාර්තා ලබාගත හැක.
   - සියලුම බදු දත්ත එම පරිගණකයේම පමණක් සැකසෙන අතර, බාහිර කිසිදු තැනකට නොයන බැවින් 
     දේශීය ආදායම් පනත යටතේ උපරිම රහස්‍යභාවය (100% Confidentiality) සුරැකේ.

-----------------------------------------------------------------------------------
[ENGLISH SUMMARY]
This package is 100% standalone and designed for restricted government intranet 
workstations connected only to RAMIS (no external internet access).

HOW TO RUN ON OFFICE PC:
1. Copy this entire "IRD_OFFLINE_PACKAGE" folder to a USB drive.
2. Paste it on the Office PC Desktop.
3. Double-click "START_IRD_FRU.bat".
4. The system starts instantly on http://localhost:5173 in Chrome/Edge.
5. Register your Officer account under "Register Officer" (stored locally & securely).
6. No Node.js, Python, or admin rights required!
===================================================================================
Engineering & Architecture by Novix Solutions • Enterprise Intelligence Division
