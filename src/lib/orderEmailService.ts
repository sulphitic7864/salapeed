import { Order, CartItem, PlantedElement } from '../types';
import { getHoodiePhoto, SALAPEED_BRAND } from '../data/mockData';

export interface EmailSimulation {
  to: string;
  from: string;
  subject: string;
  sentAt: string;
  bodyHtml: string;
  bodyText: string;
  mailtoBody?: string;
  hasArtworkAttachments: boolean;
  attachmentsCount: number;
}

/**
 * Builds the automated customer confirmation email showing renderings of their hoodie design
 */
export function generateCustomerConfirmationEmail(order: Order): EmailSimulation {
  const recipient = order.customerEmail || `${order.customerName.toLowerCase().replace(/\s+/g, '.')}@customer.bh`;

  const itemsHtml = order.items
    .map((item, idx) => {
      const frontPhoto =
        item.designPreviews?.front ||
        (item.designPreviewSide === 'front' ? item.designPreview : undefined) ||
        getHoodiePhoto(item.imageType, item.color, 'front');
      const backPhoto =
        item.designPreviews?.back ||
        (item.designPreviewSide === 'back' ? item.designPreview : undefined) ||
        getHoodiePhoto(item.imageType, item.color, 'back');
      const sleevePhoto =
        item.designPreviews?.sleeve || getHoodiePhoto(item.imageType, item.color, 'sleeve');

      const placementsList = (item.placements || [])
        .map(
          (p) =>
            `<li style="margin-bottom: 4px;">
              <strong>${p.side.toUpperCase()} (${p.zone}):</strong> 
              ${p.type === 'text' ? `Text "${p.textContent}"` : p.graphicName || 'Custom Artwork'}
              <span style="color: #666; font-size: 11px;">(Rot: ${p.rotation}°, Scale: ${Math.round(p.scale * 100)}%)</span>
            </li>`
        )
        .join('');

      return `
      <div style="background: #11141a; border: 1px solid #262c36; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #1f242e; padding-bottom: 10px; margin-bottom: 12px;">
          <div>
            <h4 style="margin: 0; color: #ffffff; font-size: 15px; font-weight: 800; text-transform: uppercase;">
              ${idx + 1}. ${item.productName}
            </h4>
            <span style="color: #39FF14; font-size: 12px; font-family: monospace;">Color: ${item.color} &bull; Size: ${item.size} &bull; Qty: ${item.qty}</span>
          </div>
          <span style="color: #ffffff; font-weight: bold; font-size: 14px;">BD ${(item.unitPrice * item.qty).toFixed(3)}</span>
        </div>

        <!-- Visual Renderings Grid -->
        <div style="display: flex; gap: 12px; margin-bottom: 12px;">
          <div style="flex: 1; background: #0c0e12; border: 1px solid #1f242e; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="color: #888; font-size: 10px; font-family: monospace; text-transform: uppercase; margin-bottom: 6px;">Front Custom View</div>
            <img src="${frontPhoto}" alt="Front Mockup" style="max-height: 140px; max-width: 100%; object-fit: contain;" />
          </div>
          <div style="flex: 1; background: #0c0e12; border: 1px solid #1f242e; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="color: #888; font-size: 10px; font-family: monospace; text-transform: uppercase; margin-bottom: 6px;">Back Custom View</div>
            <img src="${backPhoto}" alt="Back Mockup" style="max-height: 140px; max-width: 100%; object-fit: contain;" />
          </div>
          <div style="flex: 1; background: #0c0e12; border: 1px solid #1f242e; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="color: #888; font-size: 10px; font-family: monospace; text-transform: uppercase; margin-bottom: 6px;">Sleeve Custom View</div>
            <img src="${sleevePhoto}" alt="Sleeve Mockup" style="max-height: 140px; max-width: 100%; object-fit: contain;" />
          </div>
        </div>

        <!-- Placed Elements Breakdown -->
        <div style="background: #0a0b0e; border-radius: 6px; padding: 10px; font-size: 12px; color: #d0d0d0;">
          <div style="color: #39FF14; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Applied Print Placements:</div>
          <ul style="margin: 0; padding-left: 18px;">
            ${placementsList || '<li>Standard blank garment with brand left chest seal.</li>'}
          </ul>
        </div>
      </div>
      `;
    })
    .join('');

  const itemsSummaryText = order.items
    .map(
      (it, idx) =>
        `${idx + 1}. ${it.productName} - Size: ${it.size}, Color: ${it.color}, Qty: ${it.qty}, Total: BD ${(it.unitPrice * it.qty).toFixed(3)}`
    )
    .join('\n');

  const customerBodyText = `Hello ${order.customerName},

Thank you for your order #${order.id} with Salapeed!
Your custom hoodie is now queued for high-definition printing and stitching at our Bahrain workshop.

ORDER SUMMARY:
${itemsSummaryText}

Subtotal: BD ${order.subtotal.toFixed(3)}
Delivery Fee: BD ${order.deliveryFee.toFixed(3)}
Total Paid: BD ${order.total.toFixed(3)} (BenefitPay Verified)

Delivery Destination:
${order.customerAddress}
Contact Phone: ${order.customerPhone}

Workshop in Seef, Bahrain • ${SALAPEED_BRAND.phone} • ${SALAPEED_BRAND.website}`;

  return {
    to: recipient,
    from: 'orders@salapeed.bh',
    subject: `Order Confirmed: #${order.id} — Your Custom Salapeed Hoodie is in Production!`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hasArtworkAttachments: false,
    attachmentsCount: 0,
    bodyText: customerBodyText,
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #08090b; color: #ffffff; border-radius: 16px; border: 1px solid #1f242e; padding: 24px;">
        <div style="text-align: center; border-bottom: 1px solid #1f242e; padding-bottom: 20px; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 900; letter-spacing: 1px; color: #39FF14;">SALAPEED</h2>
          <div style="font-size: 11px; color: #888; font-family: monospace; margin-top: 4px;">CUSTOM PRINT HOODIE WORKSHOP &bull; BAHRAIN</div>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 6px 0; font-size: 18px; color: #ffffff;">Thank you, ${order.customerName}!</h3>
          <p style="margin: 0; font-size: 13px; color: #aaa; line-height: 1.5;">
            We've received your custom hoodie order <strong>#${order.id}</strong>. Our Seef workshop team has queued your garments for high-definition printing and precision stitching.
          </p>
        </div>

        <!-- Rendered Design Summary -->
        <div style="margin-bottom: 20px;">
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #39FF14; margin-bottom: 10px;">
            Your Custom Garment Renderings:
          </div>
          ${itemsHtml}
        </div>

        <!-- Order Summary & Delivery Details -->
        <div style="background: #11141a; border: 1px solid #262c36; border-radius: 12px; padding: 16px; font-size: 12px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #aaa;">
            <span>Subtotal:</span>
            <span style="color: #fff; font-family: monospace;">BD ${order.subtotal.toFixed(3)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #aaa;">
            <span>Flat Delivery (Bahrain):</span>
            <span style="color: #fff; font-family: monospace;">BD ${order.deliveryFee.toFixed(3)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 1px solid #1f242e; padding-top: 8px; font-size: 14px; font-weight: bold; color: #fff;">
            <span>Total Paid (BenefitPay):</span>
            <span style="color: #39FF14; font-family: monospace;">BD ${order.total.toFixed(3)}</span>
          </div>
        </div>

        <div style="background: #0f1217; border-left: 3px solid #39FF14; padding: 12px; border-radius: 0 8px 8px 0; font-size: 12px; color: #ccc; margin-bottom: 20px;">
          <strong>Delivery Destination:</strong><br />
          ${order.customerAddress}<br />
          Contact Phone: ${order.customerPhone}
        </div>

        <div style="text-align: center; font-size: 11px; color: #666; font-family: monospace; border-top: 1px solid #1f242e; padding-top: 16px;">
          Salapeed Streetwear &bull; Workshop in Seef, Bahrain &bull; ${SALAPEED_BRAND.phone}
        </div>
      </div>
    `,
  };
}

/**
 * Builds the complete production package email for the Print Shop:
 * Contains front, back, and sleeve renderings with placement coordinates,
 * plus attached high-res artwork files.
 */
export function generatePrintShopPackageEmail(
  order: Order,
  customShopEmail?: string
): EmailSimulation {
  const shopEmail = customShopEmail || 'workshop@salapeed.bh';

  // Count attached files (high-res artwork elements)
  const totalArtworks = order.items.reduce(
    (acc, it) => acc + (it.placements?.length || 0),
    0
  );

  const garmentsBreakdown = order.items
    .map((item, idx) => {
      const frontPhoto =
        item.designPreviews?.front ||
        (item.designPreviewSide === 'front' ? item.designPreview : undefined) ||
        getHoodiePhoto(item.imageType, item.color, 'front');
      const backPhoto =
        item.designPreviews?.back ||
        (item.designPreviewSide === 'back' ? item.designPreview : undefined) ||
        getHoodiePhoto(item.imageType, item.color, 'back');
      const sleevePhoto =
        item.designPreviews?.sleeve || getHoodiePhoto(item.imageType, item.color, 'sleeve');

      const printPlacementsTable = (item.placements || [])
        .map(
          (p, pIdx) => `
          <tr style="border-bottom: 1px solid #222; font-size: 11px;">
            <td style="padding: 6px 8px; font-weight: bold; color: #39FF14;">#${pIdx + 1}</td>
            <td style="padding: 6px 8px; text-transform: uppercase;">${p.side}</td>
            <td style="padding: 6px 8px;">${p.zone}</td>
            <td style="padding: 6px 8px;">${p.type === 'text' ? `Text: "${p.textContent}" (${p.textFont})` : p.graphicName || 'Artwork SVG'}</td>
            <td style="padding: 6px 8px; font-family: monospace;">X: ${p.x}% | Y: ${p.y}%</td>
            <td style="padding: 6px 8px; font-family: monospace;">${Math.round(p.scale * 100)}%</td>
            <td style="padding: 6px 8px; font-family: monospace;">${p.rotation}°</td>
          </tr>`
        )
        .join('');

      return `
      <div style="background: #11141b; border: 2px solid #2a313d; border-radius: 10px; padding: 14px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #1f242e; padding-bottom: 8px; margin-bottom: 10px;">
          <div>
            <h4 style="margin: 0; color: #ffffff; font-size: 14px; text-transform: uppercase;">
              JOB ITEM #${idx + 1}: ${item.productName}
            </h4>
            <div style="font-size: 11px; color: #888;">Silhouette: ${item.imageType} &bull; 380 GSM Heavyweight Fleece</div>
          </div>
          <div style="text-align: right;">
            <span style="background: #39FF14; color: #000; font-weight: 900; padding: 3px 8px; border-radius: 4px; font-size: 12px;">
              SIZE: ${item.size} &bull; QTY: ${item.qty}
            </span>
            <div style="font-size: 11px; color: #fff; margin-top: 3px; font-weight: bold;">COLOR: ${item.color}</div>
          </div>
        </div>

        <!-- High-Definition Operator Views -->
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
          <div style="background: #000; border: 1px solid #262c36; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="color: #39FF14; font-size: 10px; font-family: monospace; margin-bottom: 4px; font-weight: bold;">FRONT VIEW SPECIFICATION</div>
            <img src="${frontPhoto}" alt="Front Spec" style="max-height: 160px; max-width: 100%; object-fit: contain;" />
          </div>
          <div style="background: #000; border: 1px solid #262c36; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="color: #39FF14; font-size: 10px; font-family: monospace; margin-bottom: 4px; font-weight: bold;">BACK VIEW SPECIFICATION</div>
            <img src="${backPhoto}" alt="Back Spec" style="max-height: 160px; max-width: 100%; object-fit: contain;" />
          </div>
          <div style="background: #000; border: 1px solid #262c36; border-radius: 6px; padding: 8px; text-align: center;">
            <div style="color: #39FF14; font-size: 10px; font-family: monospace; margin-bottom: 4px; font-weight: bold;">SLEEVE VIEW SPECIFICATION</div>
            <img src="${sleevePhoto}" alt="Sleeve Spec" style="max-height: 160px; max-width: 100%; object-fit: contain;" />
          </div>
        </div>

        <!-- Placements Data Table -->
        <div style="background: #0a0c10; border-radius: 6px; padding: 8px; overflow-x: auto;">
          <div style="font-size: 10px; font-weight: bold; color: #aaa; text-transform: uppercase; margin-bottom: 6px;">
            Digital RIP Print & Embroidery Coordinates:
          </div>
          <table style="width: 100%; border-collapse: collapse; text-align: left; color: #ddd;">
            <thead>
              <tr style="border-bottom: 1px solid #333; color: #888; font-size: 10px;">
                <th style="padding: 4px 8px;">#</th>
                <th style="padding: 4px 8px;">Side</th>
                <th style="padding: 4px 8px;">Zone</th>
                <th style="padding: 4px 8px;">Asset/Text</th>
                <th style="padding: 4px 8px;">Origin</th>
                <th style="padding: 4px 8px;">Scale</th>
                <th style="padding: 4px 8px;">Rot</th>
              </tr>
            </thead>
            <tbody>
              ${printPlacementsTable || '<tr><td colspan="7" style="padding: 8px; text-align: center; color: #777;">Blank Garment — Standard Salapeed chest mark only</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
      `;
    })
    .join('');

  const garmentsPlainText = order.items
    .map((item, idx) => {
      const placementsText = (item.placements || [])
        .map(
          (p, pIdx) =>
            `   - Print #${pIdx + 1}: [${p.side.toUpperCase()} / ${p.zone}] ${p.type === 'text' ? `Text: "${p.textContent}" (${p.textFont})` : p.graphicName || 'Artwork SVG'} | Origin: X:${p.x}%, Y:${p.y}% | Scale: ${Math.round(p.scale * 100)}% | Rot: ${p.rotation}°`
        )
        .join('\n');

      return `[JOB ITEM #${idx + 1}] ${item.productName}
• Silhouette: ${item.imageType} (380 GSM Heavyweight Fleece)
• Size: ${item.size} | Quantity: ${item.qty} | Color: ${item.color}
• Print Placements & Coordinates:
${placementsText || '   - Standard blank garment with Salapeed seal'}`;
    })
    .join('\n\n');

  const printShopBodyText = `SALAPEED BAHRAIN WORKSHOP PRODUCTION JOB #${order.id}
==================================================
Date: ${new Date(order.createdAt).toLocaleString()}
Payment Status: BenefitPay Verified (Total: BD ${order.total.toFixed(3)})
Total Garments to Produce: ${order.items.reduce((a, b) => a + b.qty, 0)} Pieces

CUSTOMER & DISPATCH DETAILS:
--------------------------------------------------
Customer Name: ${order.customerName}
Phone Number: ${order.customerPhone}
Delivery Address: ${order.customerAddress}
${order.customerNotes ? `Customer Notes: ${order.customerNotes}\n` : ''}
GARMENTS & PRINT SPECIFICATIONS:
--------------------------------------------------
${garmentsPlainText}

HIGH-RESOLUTION ATTACHMENTS:
--------------------------------------------------
Total Artwork Attachments: ${totalArtworks} vector/SVG files
Please review coordinates and proceed with printing & stitching.

--
Salapeed Automated Workshop Dispatch System
Seef Workshop, Manama, Kingdom of Bahrain`;

  const itemsSummaryShort = order.items
    .map(
      (it, idx) =>
        `#${idx + 1}: ${it.qty}x ${it.productName} [${it.color}, Size ${it.size}]\nPlacements: ${(it.placements || []).map(p => `${p.side.toUpperCase()} (${p.zone}): ${p.type === 'text' ? `"${p.textContent}"` : p.graphicName || 'Artwork'}`).join(' | ') || 'Standard Salapeed seal'}`
    )
    .join('\n');

  const printShopMailtoBody = `SALAPEED WORKSHOP PRODUCTION JOB #${order.id}
Date: ${new Date(order.createdAt).toLocaleString()}
Customer: ${order.customerName} (Phone: ${order.customerPhone})
Delivery Address: ${order.customerAddress}
${order.customerNotes ? `Notes: ${order.customerNotes}\n` : ''}Payment: BenefitPay Verified (BD ${order.total.toFixed(3)})

GARMENTS TO PRODUCE (${order.items.reduce((a, b) => a + b.qty, 0)} Total):
${itemsSummaryShort}

Artwork: ${totalArtworks} high-res vector files on record.
Workshop: Seef, Manama, Kingdom of Bahrain`;

  return {
    to: shopEmail,
    from: 'dispatch-system@salapeed.bh',
    subject: `[PRODUCTION PACKAGE] Order #${order.id} - ${order.customerName} (${order.items.reduce((a, b) => a + b.qty, 0)} Pcs)`,
    sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    hasArtworkAttachments: true,
    attachmentsCount: totalArtworks,
    bodyText: printShopBodyText,
    mailtoBody: printShopMailtoBody,
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #07080a; color: #ffffff; border-radius: 12px; border: 2px solid #39FF14; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding-bottom: 14px; margin-bottom: 16px;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 900; color: #39FF14; text-transform: uppercase;">
              SALAPEED BAHRAIN WORKSHOP PRODUCTION JOB
            </h2>
            <div style="font-size: 11px; color: #888; font-family: monospace;">WORKSHOP SEEF &bull; HIGH-DENSITY PRINTING & EMBROIDERY</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 16px; font-weight: 900; color: #fff;">#${order.id}</div>
            <div style="font-size: 11px; color: #39FF14; font-family: monospace;">PAYMENT: BENEFITPAY VERIFIED</div>
          </div>
        </div>

        <!-- Attached High-Resolution Assets Notice -->
        <div style="background: #141f14; border: 1px solid #39FF14; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px; color: #bbf7d0;">
          <strong>✓ High-Resolution Print-Ready Package Attached:</strong>
          <div style="font-size: 11px; color: #86efac; margin-top: 4px;">
            Contains ${totalArtworks} high-resolution vector/SVG artwork file(s), full coordinate spec sheet, and mockups ready for direct-to-garment (DTG/DTF) RIP rasterization.
          </div>
        </div>

        <!-- Customer & Dispatch Coordinates -->
        <div style="background: #101318; border: 1px solid #222; border-radius: 8px; padding: 12px; margin-bottom: 16px; font-size: 12px;">
          <div style="font-weight: bold; color: #fff; margin-bottom: 4px;">Customer & Delivery Details:</div>
          <div><strong>Name:</strong> ${order.customerName} &bull; <strong>Phone:</strong> ${order.customerPhone}</div>
          <div><strong>Delivery Address:</strong> ${order.customerAddress}</div>
          ${order.customerNotes ? `<div style="color: #f59e0b; margin-top: 4px;"><strong>Customer Notes:</strong> ${order.customerNotes}</div>` : ''}
        </div>

        <!-- Production Items Breakdown -->
        <div>
          <div style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #fff; margin-bottom: 8px;">
            Garments to Print & Stitch:
          </div>
          ${garmentsBreakdown}
        </div>
      </div>
    `,
  };
}
