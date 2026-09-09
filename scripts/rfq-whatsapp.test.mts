import { createRfqSchema, parseMoq } from '../lib/rfq-schema.ts'

const ctx = { product: 'Fringe Lace', material: 'Cotton blend', width: '10mm–50mm', moq: '500 meters' }
const schema = createRfqSchema(ctx)

let failed = 0
function check(name: string, ok: boolean, extra?: unknown) {
  if (!ok) failed++
  console.log(`${ok ? 'PASS' : 'FAIL'} — ${name}`, ok ? '' : JSON.stringify(extra))
}

// 1. Below-MOQ quantity is rejected by the superRefine gate
const belowMoq = schema.safeParse({
  inquiry: 'Custom fringe lace with brushed finish for apparel edges.',
  companyName: 'Istanbul Textiles A.S.',
  workEmail: 'buyer@istanbul-textiles.com',
  quantity: 100,
  destinationPort: 'Istanbul',
  notes: '',
})
check('below-MOQ quantity rejected', !belowMoq.success)
if (!belowMoq.success) {
  check('MOQ error targets quantity field', belowMoq.error.issues.some((i) => i.path[0] === 'quantity'))
  check('MOQ error message mentions 500 meters', belowMoq.error.issues.some((i) => i.message.includes('500 meters')))
}

// 2. Missing destination port is rejected
const noPort = schema.safeParse({
  inquiry: 'Custom fringe lace with brushed finish for apparel edges.',
  companyName: 'Istanbul Textiles A.S.',
  workEmail: 'buyer@istanbul-textiles.com',
  quantity: 500,
  destinationPort: '',
  notes: '',
})
check('missing destination port rejected', !noPort.success)

// 3. Invalid email rejected
const badEmail = schema.safeParse({
  inquiry: 'Custom fringe lace with brushed finish for apparel edges.',
  companyName: 'Yokohama Trims K.K.',
  workEmail: 'not-an-email',
  quantity: 500,
  destinationPort: 'Yokohama',
  notes: '',
})
check('invalid work email rejected', !badEmail.success)

// 4. Short inquiry rejected
const shortInquiry = schema.safeParse({
  inquiry: 'hi',
  companyName: 'Yokohama Trims K.K.',
  workEmail: 'buyer@yokohama-trims.co.jp',
  quantity: 500,
  destinationPort: 'Yokohama',
  notes: '',
})
check('too-short inquiry rejected', !shortInquiry.success)

// 5. Valid at-MOQ submission passes and coerces quantity to number
const valid = schema.safeParse({
  inquiry: 'Custom fringe lace with brushed finish for apparel edges.',
  companyName: 'Yokohama Trims K.K.',
  workEmail: 'buyer@yokohama-trims.co.jp',
  quantity: '500',
  destinationPort: 'Yokohama',
  notes: 'Sample roll first.',
})
check('valid at-MOQ submission passes', valid.success)
if (valid.success) {
  check('quantity coerced to number 500', valid.data.quantity === 500)

  // 6. WhatsApp URL compiles and encodes exactly like the onSubmit function
  const lines = [
    '*New RFQ — Mohid Enterprises Showroom*',
    '',
    `*Product:* ${ctx.product}`,
    `*Material:* ${ctx.material}`,
    `*Width:* ${ctx.width}`,
    `*Product MOQ:* ${ctx.moq}`,
    '',
    `*Requested quantity:* ${valid.data.quantity}`,
    `*Destination port:* ${valid.data.destinationPort}`,
    '',
    `*Specifications:* ${valid.data.inquiry}`,
    `*Additional notes:* ${valid.data.notes || '—'}`,
    '',
    `*Company:* ${valid.data.companyName}`,
    `*Work email:* ${valid.data.workEmail}`,
  ]
  const url = `https://wa.me/92XXXXXXXXXX?text=${encodeURIComponent(lines.join('\n'))}`
  check('URL starts with wa.me link', url.startsWith('https://wa.me/92XXXXXXXXXX?text='))
  check('URL decodes back to full message', decodeURIComponent(url.split('?text=')[1]).includes('*Destination port:* Yokohama') && decodeURIComponent(url.split('?text=')[1]).includes('*Work email:* buyer@yokohama-trims.co.jp'))
  console.log('  sample URL:', url)
}

// 7. parseMoq edge cases
check('parseMoq("500 meters") === 500', parseMoq('500 meters') === 500)
check('parseMoq("250 pieces") === 250', parseMoq('250 pieces') === 250)
check('parseMoq("") === null', parseMoq('') === null)
check('no-MOQ context accepts any positive quantity', createRfqSchema({}).safeParse({
  inquiry: 'General trim inquiry for upcoming season.',
  companyName: 'ACME Apparel Ltd.',
  workEmail: 'procurement@acme.com',
  quantity: 5,
  destinationPort: 'Rotterdam',
  notes: '',
}).success)

console.log(failed === 0 ? '\nALL CHECKS PASSED' : `\n${failed} CHECK(S) FAILED`)
process.exit(failed === 0 ? 0 : 1)
