var savedLetter = '';
var savedAiPrompt = '';

var stateLaws = {
  CA: { name: 'California', days: 21, mult: 3, bonus: 0, code: 'Cal. Civ. Code § 1950.5' },
  TX: { name: 'Texas', days: 30, mult: 3, bonus: 100, code: 'Tex. Prop. Code § 92.109' },
  NY: { name: 'New York', days: 14, mult: 3, bonus: 0, code: 'N.Y. Gen. Oblig. Law § 7-108' },
  FL: { name: 'Florida', days: 30, mult: 1, bonus: 0, code: 'Fla. Stat. § 83.49' },
  IL: { name: 'Illinois', days: 30, mult: 2, bonus: 0, code: '765 ILCS 710/1' },
  GA: { name: 'Georgia', days: 30, mult: 3, bonus: 0, code: 'O.C.G.A. § 44-7-35' },
  NC: { name: 'North Carolina', days: 30, mult: 1, bonus: 0, code: 'N.C. Gen. Stat. § 42-55' },
  OH: { name: 'Ohio', days: 30, mult: 2, bonus: 0, code: 'Ohio Rev. Code § 5321.16' }
};

function setDefaultDate() {
  var d = new Date();
  d.setDate(d.getDate() - 35);
  document.getElementById('date-input').value = d.toISOString().split('T')[0];
}

function calculateClaim() {
  var st = document.getElementById('state-select').value;
  var dep = parseFloat(document.getElementById('deposit-input').value) || 0;
  var moveOutStr = document.getElementById('date-input').value;
  if (!moveOutStr) return;

  var info = stateLaws[st];
  var moveDate = new Date(moveOutStr);
  var dueDate = new Date(moveDate);
  dueDate.setDate(dueDate.getDate() + info.days);

  var today = new Date();
  var isLate = today > dueDate;
  var maxClaim = isLate ? (dep * info.mult) + info.bonus : dep;

  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('res-deadline').innerText = dueDate.toLocaleDateString('en-US');
  document.getElementById('res-law').innerText = info.code;
  document.getElementById('res-max').innerText = '$' + maxClaim.toLocaleString('en-US');

  var statusEl = document.getElementById('res-status');
  if (isLate) {
    statusEl.innerText = '🚨 OVERDUE (Bad Faith Penalties Apply)';
    statusEl.style.color = '#F87171';
  } else {
    statusEl.innerText = '⏳ Within Legal Grace Period';
    statusEl.style.color = '#FBBF24';
  }

  savedLetter = "NOTICE OF INTENT TO SUE / DEMAND FOR RETURN OF SECURITY DEPOSIT\n" +
    "Sent via USPS Certified Mail - Return Receipt Requested\n\n" +
    "Date: " + today.toLocaleDateString('en-US') + "\n" +
    "To: [Landlord / Property Management Name]\n" +
    "From: [Your Full Name], Former Tenant at [Rental Property Address]\n\n" +
    "Dear Landlord/Property Manager,\n\n" +
    "This letter serves as formal written demand for the immediate return of my security deposit in the amount of $" + dep + ", following my move-out on " + moveDate.toLocaleDateString('en-US') + ".\n\n" +
    "Under " + info.name + " law (" + info.code + "), you were legally required to return my deposit or provide a detailed itemized list of lawful deductions within " + info.days + " days (by " + dueDate.toLocaleDateString('en-US') + ").\n\n" +
    "Because this statutory deadline has passed without compliance, " + info.code + " entitles me to recover up to $" + maxClaim + " in statutory bad-faith damages, plus court costs and attorney fees.\n\n" +
    "Please remit payment of $" + dep + " within 7 business days to [Your Forwarding Address] to avoid immediate filing in Small Claims Court.\n\n" +
    "Sincerely,\n[Your Signature & Printed Name]";

  savedAiPrompt = "Act as an expert " + info.name + " Landlord-Tenant Attorney. My former landlord is withholding part of my $" + dep + " security deposit citing cleaning/repair fees after I moved out on " + moveDate.toLocaleDateString('en-US') + ". Under " + info.code + ", draft a firm rebuttal letter demanding itemized receipts, proving these charges constitute illegal 'Normal Wear and Tear', and reminding them of the $" + maxClaim + " statutory penalty for bad-faith retention.";

  document.getElementById('letter-box').style.display = 'block';
  showDoc('letter');
}

function showDoc(type) {
  document.getElementById('btn-doc-letter').className = type === 'letter' ? 'sub-btn active' : 'sub-btn';
  document.getElementById('btn-doc-ai').className = type === 'ai' ? 'sub-btn active' : 'sub-btn';
  document.getElementById('output-text').value = type === 'letter' ? savedLetter : savedAiPrompt;
  document.getElementById('copy-btn').innerText = '📋 Copy Text';
}

function copyResult() {
  var t = document.getElementById('output-text');
  t.select();
  navigator.clipboard.writeText(t.value);
  document.getElementById('copy-btn').innerText = '✅ Copied to Clipboard!';
}

setDefaultDate();
