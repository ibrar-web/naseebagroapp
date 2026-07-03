import { useEffect, useState } from 'react';
import api from '../../../utils/api';

export type TermOption = { id: string; days: number; label: string };

const toLabel = (n: number) => `${n} Day${n === 1 ? '' : 's'}`;

const FALLBACK_PAYMENT: TermOption[] = [7, 15, 30, 45, 60].map(d => ({ id: String(d), days: d, label: toLabel(d) }));
const FALLBACK_DELIVERY: TermOption[] = [1, 2, 3, 5, 7, 10, 14].map(d => ({ id: String(d), days: d, label: toLabel(d) }));

export const useOfferTerms = () => {
  const [paymentOpts, setPaymentOpts] = useState<TermOption[]>(FALLBACK_PAYMENT);
  const [deliveryOpts, setDeliveryOpts] = useState<TermOption[]>(FALLBACK_DELIVERY);
  const [termsLoading, setTermsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api.marketplace.public.getTradeConfigs({ type: 'fixed_days' })
      .then((res: any) => {
        if (!active) return;
        const rows: Array<{ id: string; name: string }> = res?.data ?? [];
        if (!rows.length) return;
        const opts: TermOption[] = rows
          .map(r => ({ id: r.id, days: Number(r.name), label: toLabel(Number(r.name)) }))
          .filter(o => o.days > 0)
          .sort((a, b) => a.days - b.days);
        setPaymentOpts(opts);
        setDeliveryOpts(opts);
      })
      .catch(() => { /* keep fallbacks */ })
      .finally(() => { if (active) setTermsLoading(false); });
    return () => { active = false; };
  }, []);

  return { paymentOpts, deliveryOpts, termsLoading };
};
