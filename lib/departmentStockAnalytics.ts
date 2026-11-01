type Quantity = number | string | null;
export interface DepartmentStockItem {
    item_id: string | number;
    item_name: string;
    unit: string;
    remaining?: Quantity;
    requested?: Quantity;
    approved?: Quantity;
    issued?: Quantity;
    received?: Quantity;
    in_transit?: Quantity;
    consumed?: Quantity;
    wastage?: Quantity;
    loss?: Quantity;
    returned?: Quantity;
}
export interface DepartmentStockRequest {
    id: string;
    item_id: string | number;
    item_name: string;
    unit: string;
    status: string;
    created_at: string | Date;
    unreceived_quantity?: Quantity;
    remaining?: Quantity;
}
export interface DepartmentStockEvent {
    request_id: string;
    action: string;
    quantity: Quantity;
    created_at: string | Date;
    performed_by?: number;
    actor_name?: string | null;
}
export interface DepartmentStockAnalyticsData {
    analytics?: DepartmentStockItem[];
    requests?: DepartmentStockRequest[];
    events?: DepartmentStockEvent[];
}
export interface StockPeriod { start: string; end: string }
const DAY = 86400000;
export const stockItemKey = (item: Pick<DepartmentStockItem, 'item_id' | 'unit'>) => `${item.item_id}:${item.unit}`;
const amount = (value: Quantity | undefined) => Number(value ?? 0);
const timestamp = (value: string | Date) => new Date(value).getTime();
const dateOnly = (value: number) => new Date(value).toISOString().slice(0, 10);
export const stockPercentage = (numerator: number, denominator: number) => denominator > 0 ? numerator / denominator * 100 : null;
const quantile = (values: number[], percentile: number) => {
    if (!values.length) return null;
    const sorted = [...values].sort((a, b) => a - b), position = (sorted.length - 1) * percentile;
    const lower = Math.floor(position);
    return sorted[lower] + (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower);
};
type Totals = { consumed: number; wastage: number; loss: number; returned: number; received: number };
const totals = (): Totals => ({ consumed: 0, wastage: 0, loss: 0, returned: 0, received: 0 });
const movementField = (action: string): keyof Totals | undefined => {
    switch (action) {
        case 'consume': return 'consumed';
        case 'wastage': return 'wastage';
        case 'loss': case 'transit_loss': return 'loss';
        case 'return': case 'return_unreceived': return 'returned';
        case 'receive': return 'received';
    }
};

export function buildDepartmentStockAnalytics(data: DepartmentStockAnalyticsData, selected: DepartmentStockItem | undefined, range: StockPeriod, now = Date.now()) {
    const start = timestamp(`${range.start}T00:00:00Z`), end = timestamp(`${range.end}T00:00:00Z`);
    const validRange = Number.isFinite(start) && Number.isFinite(end) && dateOnly(start) === range.start && dateOnly(end) === range.end && start <= end;
    const days = validRange ? Math.round((end - start) / DAY) + 1 : 0;
    const previousStart = validRange ? start - days * DAY : 0;
    const requests = data.requests ?? [];
    const byRequest = new Map(requests.map(request => [request.id, request]));
    const current = totals(), previous = totals();
    const daily = new Map<string, Totals & { day: string }>();
    const perItem = new Map<string, Totals>();
    const staff = new Map<string, Totals & { employeeid: string; name: string; movements: number }>();
    const eventTimes = new Map<string, Map<string, number>>();
    let excludedEvents = 0, orphanEvents = 0;
    for (const event of data.events ?? []) {
        const request = byRequest.get(event.request_id);
        if (!request) { orphanEvents++; continue; }
        const time = timestamp(event.created_at), quantity = amount(event.quantity);
        if (!Number.isFinite(time) || time > now || !Number.isFinite(quantity) || quantity < 0) { excludedEvents++; continue; }
        const times = eventTimes.get(request.id) ?? new Map<string, number>();
        if (event.action !== 'receive' || quantity > 0) times.set(event.action, Math.min(times.get(event.action) ?? time, time));
        eventTimes.set(request.id, times);
        const field = movementField(event.action);
        if (!field || !validRange) continue;
        const key = stockItemKey(request);
        const inPeriod = time >= start && time < end + DAY;
        if (inPeriod) {
            const itemTotals = perItem.get(key) ?? totals();
            itemTotals[field] += quantity;
            perItem.set(key, itemTotals);
        }
        if (!selected || key !== stockItemKey(selected)) continue;
        if (inPeriod) {
            current[field] += quantity;
            const day = dateOnly(time), row = daily.get(day) ?? { day, ...totals() };
            row[field] += quantity;
            daily.set(day, row);
            const actor = event.performed_by == null ? 'unknown' : String(event.performed_by);
            const actorTotals = staff.get(actor) ?? { employeeid: actor, name: event.actor_name || (actor === 'unknown' ? 'Unknown employee' : `Employee #${actor}`), movements: 0, ...totals() };
            actorTotals[field] += quantity;
            actorTotals.movements++;
            staff.set(actor, actorTotals);
        } else if (time >= previousStart && time < start) previous[field] += quantity;
    }
    const used = current.consumed;
    const dailyRate = days ? used / days : 0;
    const depleted = current.consumed + current.wastage + current.loss;
    const pipeline = [
        { name: 'Awaiting approval', value: requests.filter(row => row.status === 'requested').length },
        { name: 'Ready to issue', value: requests.filter(row => row.status === 'approved').length },
        { name: 'Awaiting receipt', value: requests.filter(row => row.status === 'issued' && amount(row.unreceived_quantity) > 0).length },
        { name: 'Receipt shortages', value: requests.filter(row => row.status === 'received' && amount(row.unreceived_quantity) > 0).length },
        { name: 'Received', value: requests.filter(row => row.status === 'received' && amount(row.unreceived_quantity) === 0).length },
        { name: 'Rejected', value: requests.filter(row => row.status === 'rejected').length },
    ];
    const pending = requests.filter(row => ['requested', 'approved'].includes(row.status) || amount(row.unreceived_quantity) > 0);
    const ages = [
        { name: 'Under 1 day', value: 0 }, { name: '1-3 days', value: 0 },
        { name: '4-7 days', value: 0 }, { name: 'Over 7 days', value: 0 },
    ];
    let unknownAges = 0;
    for (const request of pending) {
        const time = timestamp(request.created_at);
        if (!Number.isFinite(time) || time > now) { unknownAges++; continue; }
        const age = (now - time) / DAY;
        ages[age < 1 ? 0 : age < 4 ? 1 : age < 8 ? 2 : 3].value++;
    }
    const leadTimes = [
        { name: 'Request to approval', start: 'request', end: 'approve', samples: [] as number[] },
        { name: 'Approval to issue', start: 'approve', end: 'issue', samples: [] as number[] },
        { name: 'Issue to first receipt', start: 'issue', end: 'receive', samples: [] as number[] },
    ];
    for (const request of requests) {
        if (!selected || stockItemKey(request) !== stockItemKey(selected)) continue;
        const times = eventTimes.get(request.id);
        for (const stage of leadTimes) {
            const from = stage.start === 'request' ? timestamp(request.created_at) : times?.get(stage.start);
            const to = times?.get(stage.end);
            if (validRange && from != null && to != null && Number.isFinite(from) && to >= from && to >= start && to < end + DAY) stage.samples.push((to - from) / 3600000);
        }
    }
    const replenishment = (data.analytics ?? []).map(item => {
        const consumed = perItem.get(stockItemKey(item))?.consumed ?? 0;
        const rate = days ? consumed / days : 0;
        const remaining = amount(item.remaining);
        const cover = rate > 0 ? remaining / rate : null;
        const validSnapshot = [item.remaining,item.issued,item.received,item.in_transit,item.consumed,item.wastage,item.loss,item.returned].every(value=>Number.isFinite(amount(value)) && amount(value)>=0);
        const difference = validSnapshot ? Math.round((amount(item.issued)-[item.consumed,item.wastage,item.loss,item.returned,item.in_transit,item.remaining].reduce<number>((sum,value)=>sum+amount(value),0))*10000)/10000 || 0 : null;
        return { ...item, consumedInPeriod: consumed, dailyRate: rate, cover: validSnapshot ? cover : null, validSnapshot, difference,
            wastageInPeriod: perItem.get(stockItemKey(item))?.wastage ?? 0,
            lossInPeriod: perItem.get(stockItemKey(item))?.loss ?? 0,
            status: !validSnapshot ? 'Invalid stock data' : remaining <= 0 ? 'No stock' : cover == null ? 'No recorded usage' : cover <= 7 ? 'Within 7 days' : 'Above 7 days' };
    }).sort((a, b) => (a.cover ?? (amount(a.remaining) <= 0 ? 0 : Infinity)) - (b.cover ?? (amount(b.remaining) <= 0 ? 0 : Infinity)) || a.item_name.localeCompare(b.item_name));
    const exceptions = replenishment.filter(item => !item.validSnapshot || item.difference !== 0 || amount(item.remaining)<=0 || amount(item.in_transit)>0 || item.cover!=null&&item.cover<=7 || item.wastageInPeriod>0 || item.lossInPeriod>0).map(item=>({
        ...item, signals: [
            ...(!item.validSnapshot?['Invalid stock data']:[]),
            ...(item.difference!=null&&item.difference!==0?['Reconciliation difference']:[]),
            ...(item.validSnapshot&&amount(item.remaining)<=0?['No available stock']:[]),
            ...(item.cover!=null&&item.cover<=7?['Cover within 7 days']:[]),
            ...(amount(item.in_transit)>0?['Outstanding delivery']:[]),
            ...(item.wastageInPeriod>0?['Period wastage']:[]),
            ...(item.lossInPeriod>0?['Period loss / theft']:[]),
        ],
    })).sort((a,b)=>{
        const priority=(item:typeof a)=>!item.validSnapshot?0:item.difference!==0?1:amount(item.remaining)<=0?2:item.lossInPeriod>0?3:item.cover!=null&&item.cover<=7?4:5;
        return priority(a)-priority(b)||a.item_name.localeCompare(b.item_name);
    });
    const periodRequests = validRange ? requests.filter(row=>{const time=timestamp(row.created_at);return Number.isFinite(time)&&time>=start&&time<end+DAY;}) : [];
    const health = {
        trackedItems: replenishment.length,
        noStock: replenishment.filter(item=>item.validSnapshot&&amount(item.remaining)<=0).length,
        lowCover: replenishment.filter(item=>item.validSnapshot&&amount(item.remaining)>0&&item.cover!=null&&item.cover<=7).length,
        discrepancies: replenishment.filter(item=>item.difference!=null&&item.difference!==0).length,
        invalidItems: replenishment.filter(item=>!item.validSnapshot).length,
        outstanding: pending.length,
        aged: ages[3].value,
        periodRequests: periodRequests.length,
        rejectedRate: stockPercentage(periodRequests.filter(row=>row.status==='rejected').length,periodRequests.length),
    };
    const trend: (Totals & {day:string})[] = [];
    // Bound chart density while retaining zero-usage days and the full selected period.
    if(validRange&&days<=366){
        for(let time=start;time<=end;time+=DAY){const day=dateOnly(time);trend.push(daily.get(day)??{day,...totals()});}
    } else if(validRange){
        const monthly=new Map<string,Totals & {day:string}>();
        for(const row of daily.values()){
            const month=row.day.slice(0,7),value=monthly.get(month)??{day:month,...totals()};
            for(const field of Object.keys(totals()) as (keyof Totals)[])value[field]+=row[field];
            monthly.set(month,value);
        }
        const cursor=new Date(start);cursor.setUTCDate(1);
        while(cursor.getTime()<=end){const month=dateOnly(cursor.getTime()).slice(0,7);trend.push(monthly.get(month)??{day:month,...totals()});cursor.setUTCMonth(cursor.getUTCMonth()+1);}
    }
    return {
        validRange, days, current, previous, dailyRate,
        comparison: validRange ? { start: dateOnly(previousStart), end: dateOnly(start - DAY), change: previous.consumed > 0 ? (used - previous.consumed) / previous.consumed * 100 : null } : null,
        cover: selected ? replenishment.find(item=>stockItemKey(item)===stockItemKey(selected))?.cover??null : null,
        wastageRate: stockPercentage(current.wastage, depleted),
        lossRate: stockPercentage(current.loss, depleted),
        trend, trendUnit: days>366?'month':'day', hasUsage: depleted>0,
        staff: [...staff.values()].sort((a, b) => b.consumed - a.consumed || a.name.localeCompare(b.name)),
        pipeline, ages, unknownAges, excludedEvents, orphanEvents, replenishment, exceptions, health,
        depletionRate: days?depleted/days:0,
        depletionCover: days&&depleted>0&&selected&&replenishment.find(item=>stockItemKey(item)===stockItemKey(selected))?.validSnapshot?amount(selected.remaining)/(depleted/days):null,
        leadTimes: leadTimes.map(stage => ({ name: stage.name, samples: stage.samples.length, hours: stage.samples.length ? stage.samples.reduce((sum, hours) => sum + hours, 0) / stage.samples.length : null, median:quantile(stage.samples,.5), p90:quantile(stage.samples,.9) })),
    };
}
