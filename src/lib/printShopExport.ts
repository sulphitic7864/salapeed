import { Order, CartItem, PlantedElement } from '../types';
import { getHoodiePhoto, PRINT_ZONES, SALAPEED_BRAND } from '../data/mockData';

export interface PrintShopAttachment {
  filename: string;
  contentType: string;
  content: string;
}

export interface PrintShopDispatchBundle {
  spec: Record<string, unknown>;
  attachments: PrintShopAttachment[];
}

export interface PrintShopPackage {
  orderId: string;
  generatedAt: string;
  facility: string;
  paymentMethod: string;
  totalBHD: number;
  customer: {
    name: string;
    phone: string;
    address: string;
    notes?: string;
  };
  garments: {
    itemIndex: number;
    productName: string;
    silhouette: string;
    fabricGsm: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
    hdMockups: {
      front: string;
      back: string;
      sleeve: string;
    };
    printPlacements: {
      side: string;
      zone: string;
      type: string;
      graphicName?: string;
      scalePercentage: number;
      rotationDegrees: number;
      positionPct: { x: number; y: number };
      inkColor?: string;
      svgArtwork?: string;
      imageUrl?: string;
      printReadyUrl?: string;
    }[];
  }[];
}

export function buildPrintShopPackage(order: Order): PrintShopPackage {
  return {
    orderId: order.id,
    generatedAt: new Date().toISOString(),
    facility: 'Salapeed Bahrain Central Apparel Print & Embroidery Workshop',
    paymentMethod: order.paymentMethod,
    totalBHD: order.total,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      address: order.customerAddress,
      notes: order.customerNotes,
    },
    garments: order.items.map((item, idx) => ({
      itemIndex: idx + 1,
      productName: item.productName,
      silhouette: item.imageType === 'zipper' ? 'Full-Zip Metallic Fleece Hoodie' : 'Pullover Fleece Hoodie (Kangaroo Pocket)',
      fabricGsm: '380 GSM Heavyweight Streetwear Cotton Fleece',
      color: item.color,
      size: item.size,
      quantity: item.qty,
      unitPrice: item.unitPrice,
      hdMockups: {
        front:
          item.designPreviews?.front ||
          (item.designPreviewSide === 'front' ? item.designPreview : undefined) ||
          `${window.location.origin}${getHoodiePhoto(item.imageType, item.color, 'front')}`,
        back:
          item.designPreviews?.back ||
          (item.designPreviewSide === 'back' ? item.designPreview : undefined) ||
          `${window.location.origin}${getHoodiePhoto(item.imageType, item.color, 'back')}`,
        sleeve:
          item.designPreviews?.sleeve ||
          `${window.location.origin}${getHoodiePhoto(item.imageType, item.color, 'sleeve')}`,
      },
      printPlacements: (item.placements || []).map((el: PlantedElement) => ({
        side: el.side,
        zone: el.zone,
        type: el.type,
        graphicName: el.graphicName,
        scalePercentage: Math.round(el.scale * 100),
        rotationDegrees: el.rotation,
        positionPct: { x: el.x, y: el.y },
        inkColor: el.textColor || '#39FF14',
        svgArtwork: el.svgContent,
        imageUrl: el.imageUrl,
        printReadyUrl: el.printReadyUrl,
      })),
    })),
  };
}

function dataUrlToAttachment(dataUrl: string, filename: string): PrintShopAttachment {
  const match = dataUrl.match(/^data:([^;,]+)(;base64)?,([\s\S]*)$/i);
  if (!match) throw new Error(`Could not prepare print asset: ${filename}`);

  const content = match[2]
    ? match[3]
    : encodeUtf8(decodeURIComponent(match[3]));

  return { filename, contentType: match[1], content };
}

function encodeUtf8(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

function safeFilePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-');
}

export function buildPrintShopDispatchBundle(order: Order): PrintShopDispatchBundle {
  const orderPart = safeFilePart(order.id);
  const attachments: PrintShopAttachment[] = [];
  const garments = order.items.map((item, itemIndex) => {
    const itemPart = String(itemIndex + 1).padStart(2, '0');
    const previews = {
      front: item.designPreviews?.front || (item.designPreviewSide === 'front' ? item.designPreview : undefined),
      back: item.designPreviews?.back || (item.designPreviewSide === 'back' ? item.designPreview : undefined),
    };

    if (!previews.front || !previews.back) {
      throw new Error(`Item ${itemIndex + 1} is missing a saved front or back design preview.`);
    }

    const mockupFiles = {
      front: `SALAPEED-${orderPart}-ITEM-${itemPart}-FRONT.jpg`,
      back: `SALAPEED-${orderPart}-ITEM-${itemPart}-BACK.jpg`,
    };
    attachments.push(dataUrlToAttachment(previews.front, mockupFiles.front));
    attachments.push(dataUrlToAttachment(previews.back, mockupFiles.back));

    const printPlacements = (item.placements || []).map((element, placementIndex) => {
      const side = element.side === 'sleeve' ? 'front' : element.side;
      const zone = PRINT_ZONES.find((candidate) => candidate.name === element.zone && candidate.side === side) ||
        (element.side === 'sleeve' ? PRINT_ZONES.find((candidate) => candidate.id === 'front-left-sleeve') : undefined);
      const source = element.printReadyUrl || element.imageUrl;
      const sourceIsDataUrl = source?.startsWith('data:') || false;

      const zoneBounds = zone?.boundingBox;

      return {
        side,
        zone: zone?.name || element.zone,
        zoneBoundsPct: zoneBounds,
        centerInZonePct: { x: element.x, y: element.y },
        centerOnGarmentPct: zoneBounds ? {
          x: zoneBounds.left + (element.x / 100) * zoneBounds.width,
          y: zoneBounds.top + (element.y / 100) * zoneBounds.height,
        } : undefined,
        scale: element.scale,
        rotationDegrees: element.rotation,
        type: element.type,
        text: element.type === 'text' ? {
          content: element.textContent,
          font: element.textFont,
          color: element.textColor,
          curved: element.textCurve,
        } : undefined,
        artworkName: element.graphicName,
        artworkSourceUrl: !element.svgContent && source && !sourceIsDataUrl
          ? new URL(source, window.location.origin).href
          : undefined,
        lowResolutionUpload: element.isLowRes || undefined,
      };
    });

    return {
      itemIndex: itemIndex + 1,
      productName: item.productName,
      silhouette: item.imageType,
      color: item.color,
      size: item.size,
      quantity: item.qty,
      mockupFiles,
      printPlacements,
    };
  });

  const spec = {
    orderId: order.id,
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod,
    customer: {
      name: order.customerName,
      phone: order.customerPhone,
      address: order.customerAddress,
      notes: order.customerNotes,
    },
    garments,
  };
  attachments.push({
    filename: `SALAPEED-${orderPart}-PRINT-PLACEMENTS.json`,
    contentType: 'application/json',
    content: encodeUtf8(JSON.stringify(spec, null, 2)),
  });

  return { spec, attachments };
}

export async function releasePrintShopPackage(
  orderId: string,
  recipient: string,
  email: { subject: string; bodyHtml: string; bodyText: string },
  bundle: PrintShopDispatchBundle
): Promise<{ id: string }> {
  const response = await fetch('/api/print-shop/dispatch', {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId,
      to: recipient,
      subject: email.subject,
      html: email.bodyHtml.replace(/src=(['\"])data:[\s\S]*?\1/gi, ''),
      text: email.bodyText,
      bankConfirmed: true,
      attachments: bundle.attachments,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'The print-shop email could not be sent.');
  }
  return result;
}

/**
 * Downloads a high-definition electronic JSON file for RIP software & digital garment printers
 */
export function downloadPrintShopElectronicFile(order: Order): void {
  const pkg = buildPrintShopPackage(order);
  const jsonStr = JSON.stringify(pkg, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SALAPEED-PRINT-SHOP-SPEC-${order.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens an electronic print sheet with high-definition garment mockups for workshop operators
 */
export function openPrintShopSpecSheet(order: Order): void {
  const pkg = buildPrintShopPackage(order);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow popups to view the electronic print shop spec sheet.');
    return;
  }

  const itemsHtml = pkg.garments
    .map(
      (g) => `
      <div style="border: 2px solid #222; border-radius: 8px; padding: 16px; margin-bottom: 24px; page-break-inside: avoid; background: #fff;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 8px;">
          <div>
            <h3 style="margin: 0; font-size: 18px; text-transform: uppercase;">Item #${g.itemIndex}: ${g.productName}</h3>
            <div style="font-size: 13px; color: #555; margin-top: 4px;">${g.silhouette} &bull; <strong>${g.fabricGsm}</strong></div>
          </div>
          <div style="text-align: right;">
            <span style="display: inline-block; background: #111; color: #fff; font-weight: bold; padding: 4px 10px; border-radius: 4px; font-size: 14px;">
              Size: ${g.size} &bull; Qty: ${g.quantity}
            </span>
            <div style="font-size: 12px; margin-top: 4px; font-weight: bold; color: #222;">Color: ${g.color}</div>
          </div>
        </div>

        <!-- High-Definition Garment Views -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;">
          <div style="border: 1px solid #ccc; border-radius: 6px; padding: 8px; text-align: center; background: #fbfbfb;">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 6px;">HD Front View & Placement Reference</div>
            <img src="${g.hdMockups.front}" alt="Front Mockup" style="max-height: 240px; max-width: 100%; object-fit: contain;" />
          </div>
          <div style="border: 1px solid #ccc; border-radius: 6px; padding: 8px; text-align: center; background: #fbfbfb;">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666; margin-bottom: 6px;">HD Back View & Placement Reference</div>
            <img src="${g.hdMockups.back}" alt="Back Mockup" style="max-height: 240px; max-width: 100%; object-fit: contain;" />
          </div>
        </div>

        <!-- Placements Matrix -->
        <h4 style="margin: 12px 0 6px 0; font-size: 13px; text-transform: uppercase; color: #111; border-bottom: 1px solid #eee; padding-bottom: 4px;">
          Print Coordinate Specifications (${g.printPlacements.length} layers)
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 6px;">
          <thead>
            <tr style="background: #f0f0f0; text-align: left;">
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Angle / Side</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Zone</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Artwork / Text</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Center X%</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Center Y%</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Scale</th>
              <th style="padding: 6px 8px; border: 1px solid #ddd;">Rotation</th>
            </tr>
          </thead>
          <tbody>
            ${g.printPlacements
              .map(
                (p) => `
              <tr>
                <td style="padding: 6px 8px; border: 1px solid #ddd; font-weight: bold; text-transform: uppercase;">${p.side}</td>
                <td style="padding: 6px 8px; border: 1px solid #ddd;">${p.zone}</td>
                <td style="padding: 6px 8px; border: 1px solid #ddd;">${p.graphicName || p.type}</td>
                <td style="padding: 6px 8px; border: 1px solid #ddd; font-family: monospace;">${p.positionPct.x}%</td>
                <td style="padding: 6px 8px; border: 1px solid #ddd; font-family: monospace;">${p.positionPct.y}%</td>
                <td style="padding: 6px 8px; border: 1px solid #ddd; font-family: monospace;">${p.scalePercentage}%</td>
                <td style="padding: 6px 8px; border: 1px solid #ddd; font-family: monospace;">${p.rotationDegrees}&deg;</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
    )
    .join('');

  win.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Salapeed Electronic Workshop Print Spec - Order #${order.id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 24px; color: #111; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; display: flex; gap: 10px;">
          <button onclick="window.print()" style="padding: 10px 18px; background: #000; color: #fff; font-weight: bold; border-radius: 6px; cursor: pointer;">
            Print / Save as PDF
          </button>
          <button onclick="window.close()" style="padding: 10px 18px; background: #eee; border: 1px solid #ccc; font-weight: bold; border-radius: 6px; cursor: pointer;">
            Close Window
          </button>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px;">
          <div>
            <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px; font-weight: 900;">SALAPEED STREETWEAR</h1>
            <div style="font-size: 13px; font-weight: bold; color: #444; margin-top: 4px;">BAHRAIN CENTRAL APPAREL PRINT WORKSHOP & EMBROIDERY</div>
            <div style="font-size: 12px; color: #666;">Generated: ${new Date(pkg.generatedAt).toLocaleString()}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 22px; font-weight: 900; font-family: monospace;">ORDER #${order.id}</div>
            <div style="display: inline-block; background: #39FF14; color: #000; font-weight: bold; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-top: 4px;">
              PAYMENT MUST BE BANK-VERIFIED BEFORE PRESS RELEASE
            </div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; font-size: 13px; background: #f8f8f8; padding: 12px; border-radius: 6px;">
          <div>
            <strong>Customer:</strong> ${pkg.customer.name}<br />
            <strong>Contact:</strong> ${pkg.customer.phone}
          </div>
          <div>
            <strong>Delivery Address:</strong> ${pkg.customer.address}<br />
            <strong>Payment Method:</strong> ${pkg.paymentMethod} (bank verification required before release)
          </div>
        </div>

        ${itemsHtml}

        <div style="border-top: 1px solid #ddd; padding-top: 12px; font-size: 11px; color: #777; text-align: center;">
          Salapeed Custom Apparel Workshop &bull; Commercial Electronic Print File &bull; All Print Zones Calibrated for 380 GSM Heavy Cotton Fleece
        </div>
      </body>
    </html>
  `);
  win.document.close();
}
