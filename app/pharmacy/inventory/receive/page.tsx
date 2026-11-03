'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import PharmacyReceivingModal from '../../components/PharmacyReceivingModal';
import { Empty, Message, styles, usePharmacyAccess, usePharmacyResource } from '../../components/PharmacyWorkspace';

const orderPath = (id: string) => `/pharmacy/inventory/orders?order=${encodeURIComponent(id)}`;
export default function PharmacyReceivePage() {
  const access = usePharmacyAccess(), params = useSearchParams();
  if (!access.stock) return <main className={styles.page}><h1>Receive stock</h1><Empty>Pharmacy stock access is required.</Empty></main>;
  const deliveryId = params.get('deliveryId');
  if (deliveryId) return <ExistingDelivery key={deliveryId} id={deliveryId}/>;
  const orderId = params.get('orderId') || '', itemId = params.get('itemId') || '';
  return <ReceivingPage key={`${orderId}:${itemId}`} orderId={orderId} itemId={itemId}/>;
}
function ReceivingPage({ orderId = '', itemId, delivery, onCompleted = async () => {} }: { orderId?: string; itemId?: string; delivery?: unknown; onCompleted?: () => Promise<void> }) {
  const router = useRouter(), back = orderId ? orderPath(orderId) : '/pharmacy/inventory/deliveries';
  return <PharmacyReceivingModal presentation="page" initialOrderId={orderId} initialItemId={itemId} initialDelivery={delivery}
    backLabel={orderId ? 'Back to purchase order' : 'Back to deliveries'} onClose={() => router.push(back)} onCompleted={onCompleted}
    onPaySupplier={() => router.push(orderId ? `${orderPath(orderId)}#payments` : '/pharmacy/accounting/payables')}/>;
}
function ExistingDelivery({ id }: { id: string }) {
  const resource = usePharmacyResource(`pharmacy/receiving/deliveries/${encodeURIComponent(id)}`);
  if (resource.error) return <main className={styles.page}><h1>Receive stock</h1><Message error={resource.error}/><div className={styles.actions}><Link className="btn btn-outline-secondary" href="/pharmacy/inventory/deliveries">Back to deliveries</Link><button type="button" className="btn btn-outline-primary" onClick={resource.refresh}>Retry loading delivery</button></div></main>;
  if (resource.loading || !resource.data) return <main className={styles.page}><h1>Receive stock</h1><p role="status">Loading delivery...</p></main>;
  return <ReceivingPage orderId={resource.data.details.orderId || ''} delivery={resource.data} onCompleted={resource.refresh}/>;
}
