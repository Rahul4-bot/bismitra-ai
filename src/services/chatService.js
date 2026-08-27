import standardsData from '../data/standards.json';
import sourcesData from '../data/sources.json';

/**
 * Service to simulate intelligent AI responses with simulated reasoning delay,
 * structured source citations, and interactive next steps.
 */
export async function sendChatMessage(queryText, options = {}) {
  // Simulate realistic network & reasoning latency (400ms - 700ms)
  await new Promise((resolve) => setTimeout(resolve, 500));

  const query = queryText.toLowerCase().trim();

  // 1. Standard search queries (e.g. "electric iron", "helmet", "water", "led", "standard applies")
  if (query.includes('iron') || query.includes('electric iron')) {
    const std = standardsData.find(s => s.id === 'is-302-2-3');
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Applicable Indian Standard for Electric Irons\n\nFor **Electric Irons** (dry and steam irons for domestic use), the applicable Indian Standard is **${std.standardNumber}** — *${std.title}*.\n\n**Key Compliance Highlights:**\n- **Mandatory Status:** ${std.mandatoryStatus} under the Ministry of Heavy Industries Quality Control Order (QCO).\n- **Certification Scheme:** ${std.scheme}.\n- **Primary Testing Focus:** ${std.keyTests.slice(0, 3).join(', ')}.\n\nManufacturers and importers cannot legally sell electric irons in India without a valid BIS ISI License.`,
      sources: [
        std.sourceRef,
        sourcesData.find(s => s.id === 'src-qco-iron') || sourcesData[1]
      ],
      suggestedActions: [
        { label: 'View 7-Step Compliance Roadmap', targetTab: 'certification', payload: { product: 'Electric Iron', standardId: 'is-302-2-3' } },
        { label: 'Find Authorized Testing Labs', targetTab: 'labs', payload: { category: 'Electrical Appliances' } },
        { label: 'Open Product Finder', targetTab: 'find-standard', payload: { product: 'Electric Iron' } }
      ],
      matchedStandard: std
    };
  }

  if (query.includes('water') || query.includes('packaged drinking water') || query.includes('bottle')) {
    const std = standardsData.find(s => s.id === 'is-14543');
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Standard for Packaged Drinking Water\n\nPackaged drinking water is governed by **${std.standardNumber}** (*${std.title}*).\n\n**Mandatory Requirements:**\n- Mandatory ISI certification under **FSSAI & BIS regulations**.\n- Every manufacturing unit must have an in-house microbiological laboratory.\n- Key quality parameters include testing for **pesticide residues, toxic heavy metals (Lead, Arsenic), and bacterial contamination**.\n- Water jars and bottles must visibly carry the ISI Mark with the CM/L (Certification Mark License) 7-digit number.`,
      sources: [
        std.sourceRef,
        sourcesData.find(s => s.id === 'src-scheme-1') || sourcesData[2]
      ],
      suggestedActions: [
        { label: 'Explore Compliance Roadmap', targetTab: 'certification', payload: { product: 'Packaged Drinking Water' } },
        { label: 'Locate Water Testing Labs', targetTab: 'labs', payload: { category: 'Food & Beverages' } },
        { label: 'Consumer ISI Verification', targetTab: 'consumer', payload: { mode: 'isi' } }
      ],
      matchedStandard: std
    };
  }

  if (query.includes('helmet') || query.includes('two wheeler') || query.includes('bike')) {
    const std = standardsData.find(s => s.id === 'is-4151');
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Mandatory Standard for Protective Helmets\n\nTwo-wheeler rider helmets in India must comply with **${std.standardNumber}** (*${std.title}*).\n\n**Regulatory Overview:**\n- **Mandatory Enforcement:** Notified under the Motor Vehicles Act by MoRTH.\n- **Crucial Testing Rigors:** Impact attenuation (drop-tower test), chin strap retention strength, and visor optical clarity.\n- Non-ISI helmets are illegal to manufacture, stock, or sell across India.`,
      sources: [
        std.sourceRef,
        sourcesData.find(s => s.id === 'src-scheme-1') || sourcesData[0]
      ],
      suggestedActions: [
        { label: 'View Certification Guide', targetTab: 'certification', payload: { product: 'Protective Helmet' } },
        { label: 'Search Mechanical Testing Labs', targetTab: 'labs', payload: { category: 'Consumer & Safety Goods' } }
      ],
      matchedStandard: std
    };
  }

  // 2. Generic "Which BIS standard applies to my product?"
  if (query.includes('which bis standard applies') || query.includes('which standard') || query.includes('apply to my product') || query.includes('find standard')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Product Standard Identification Assistant\n\nTo identify the exact Indian Standard (IS code) for your product, BIS classifies goods under specific technical sectors (Electrical, Food, Mechanical, Electronics/IT, Construction, Chemical).\n\n**How BIS Determines Standards:**\n1. **Product Function & Scope:** The primary operating purpose and voltage/power/material rating.\n2. **Quality Control Orders (QCOs):** Whether mandatory certification applies under Indian Gazette notifications.\n3. **Applicable Scheme:** Scheme-I (ISI Mark) vs Scheme-II (Compulsory Registration Scheme - CRS).\n\nYou can use our dedicated **Find My Standard** tool or type a specific product name (e.g. *Electric Iron, LED Bulb, Steel TMT Bars, Helmets*).`,
      sources: [
        sourcesData.find(s => s.id === 'src-scheme-1') || sourcesData[2],
        sourcesData.find(s => s.id === 'src-is-302') || sourcesData[0]
      ],
      suggestedActions: [
        { label: 'Launch Product Finder Tool', targetTab: 'find-standard' },
        { label: 'Check Electric Iron (Demo)', payloadText: 'Which standard applies to electric iron?' },
        { label: 'Check Packaged Water (Demo)', payloadText: 'Standard for packaged drinking water' }
      ]
    };
  }

  // 3. "How do I get BIS certification?"
  if (query.includes('how do i get bis certification') || query.includes('get certification') || query.includes('certification process') || query.includes('isi mark process')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### BIS Product Certification Process (Scheme-I)\n\nObtaining a BIS License (ISI Mark) involves a structured **7-step conformity assessment lifecycle**:\n\n1. **Identify Standard & Scheme:** Verify your product's applicable Indian Standard (IS) and QCO order.\n2. **In-house Testing Facilities:** Ensure mandatory testing apparatus and qualified quality control personnel exist at the factory.\n3. **Portal Application:** Submit application via the official Manakonline portal with test fees.\n4. **Preliminary Factory Inspection:** A BIS inspecting officer audits manufacturing and testing capabilities and draws independent samples.\n5. **Independent Lab Testing:** Samples are sealed and tested at a BIS Central or Recognized NABL Laboratory.\n6. **Scrutiny & Review:** Review of test reports and conformity against standard specifications.\n7. **Grant of License (CML):** Issuance of the Certification Marks License (CM/L) number.`,
      sources: [
        sourcesData.find(s => s.id === 'src-scheme-1') || sourcesData[2],
        sourcesData.find(s => s.id === 'src-lab-rules') || sourcesData[4]
      ],
      suggestedActions: [
        { label: 'Interactive 7-Step Roadmap', targetTab: 'certification' },
        { label: 'Find Approved Testing Laboratories', targetTab: 'labs' },
        { label: 'Consumer Verification Guide', targetTab: 'consumer' }
      ]
    };
  }

  // 4. "What is the hallmarking process?" or Hallmarking queries
  if (query.includes('hallmarking') || query.includes('huid') || query.includes('gold') || query.includes('jewellery') || query.includes('silver')) {
    const std = standardsData.find(s => s.id === 'is-1417');
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Hallmarking & HUID (Hallmark Unique Identification)\n\nHallmarking in India is the official certification of the purity and fineness of gold and silver articles under **${std.standardNumber}**.\n\n**The 3 Mandatory Marks on Gold Jewellery:**\n1. **BIS Standard Logo** (Triangular Mark)\n2. **Purity in Karats & Fineness** (e.g. \`22K916\`, \`18K750\`, \`14K585\`)\n3. **6-Digit Alphanumeric HUID Code** (Unique laser-engraved ID for every individual piece)\n\n**HUID Verification for Consumers:** Consumers can verify authenticity, jeweler registration, and assaying date using the BIS Care mobile application or our prototype verifier.`,
      sources: [
        std.sourceRef,
        sourcesData.find(s => s.id === 'src-hallmark-is1417') || sourcesData[3]
      ],
      suggestedActions: [
        { label: 'Open Hallmarking & HUID Portal', targetTab: 'hallmarking' },
        { label: 'Test HUID Simulator', targetTab: 'hallmarking', payload: { mode: 'huid-sim' } },
        { label: 'Consumer Jewellery Rights', targetTab: 'consumer' }
      ],
      matchedStandard: std
    };
  }

  // 5. "Where can I find a testing laboratory?"
  if (query.includes('testing laboratory') || query.includes('find lab') || query.includes('testing lab') || query.includes('nabl') || query.includes('where can i find a lab')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### BIS Testing Laboratory Directory\n\nBIS maintains a nationwide network of testing laboratories consisting of:\n- **BIS Central & Regional Laboratories:** Government-owned flagship test houses (e.g. Sahibabad CL, Chennai SRO, Kolkata ERO, Mumbai WRO).\n- **BIS Recognized Laboratories (LRS):** NABL-accredited commercial and research laboratories evaluated under the Laboratory Recognition Scheme.\n\n**Available Search Filters in Directory:**\n- By Geographic State & Region\n- By Product Category (Electrical, Food/Water, Construction, Mechanical, Chemical)\n- By Testing Scope & Standard Code`,
      sources: [
        sourcesData.find(s => s.id === 'src-lab-rules') || sourcesData[4],
        sourcesData.find(s => s.id === 'src-scheme-1') || sourcesData[2]
      ],
      suggestedActions: [
        { label: 'Browse Testing Laboratories Directory', targetTab: 'labs' },
        { label: 'Filter Electrical Appliance Labs', targetTab: 'labs', payload: { category: 'Electrical Appliances' } },
        { label: 'Filter Water Testing Labs', targetTab: 'labs', payload: { category: 'Food & Beverages' } }
      ]
    };
  }

  // 6. Consumer Help queries
  if (query.includes('consumer') || query.includes('fake') || query.includes('complaint') || query.includes('verify isi') || query.includes('grievance')) {
    return {
      id: 'msg-' + Date.now(),
      sender: 'bismitra',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `### Consumer Protection & Verification Services\n\nBIS protects consumer rights against substandard and counterfeit products through digital verification and swift grievance redressal mechanisms.\n\n**Key Consumer Tools:**\n- **Verify ISI Mark (CM/L Number):** Enter the 7 or 8-digit license number to verify manufacturer name, factory address, and validity.\n- **Verify Hallmark (HUID):** Check 6-digit laser code for gold purity and assay center.\n- **Lodge Grievance:** Report counterfeit ISI marks, misleading quality claims, or refusal of standard compliance.\n- **National Consumer Helpline:** Toll-free assistance at **1915**.`,
      sources: [
        sourcesData.find(s => s.id === 'src-consumer-rights') || sourcesData[5]
      ],
      suggestedActions: [
        { label: 'Open Consumer Help Center', targetTab: 'consumer' },
        { label: 'Verify ISI Mark Simulator', targetTab: 'consumer', payload: { mode: 'isi' } }
      ]
    };
  }

  // 7. General Intelligent Fallback
  return {
    id: 'msg-' + Date.now(),
    sender: 'bismitra',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `### Intelligent BIS Assistance\n\nI have analyzed your query regarding **"${queryText}"**.\n\nBISMITRA AI can help you navigate:\n- **Applicable Indian Standards (IS Codes)** for your specific product\n- **Mandatory Quality Control Orders (QCOs)** and certification requirements\n- **7-Step Compliance Roadmap** for obtaining an ISI Mark / CRS license\n- **Hallmarking & 6-digit HUID** verification for gold jewellery\n- **NABL & BIS Authorized Testing Laboratories**\n\nSelect a quick action below or specify your product name (e.g. *Electric Iron, Packaged Water, TMT Steel, Helmet, LED Bulb*).`,
    sources: [
      sourcesData[0],
      sourcesData[2]
    ],
    suggestedActions: [
      { label: 'Find Standard for My Product', targetTab: 'find-standard' },
      { label: 'View 7-Step Certification Roadmap', targetTab: 'certification' },
      { label: 'Browse Testing Laboratories', targetTab: 'labs' }
    ]
  };
}
