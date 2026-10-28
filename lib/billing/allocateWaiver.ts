/** Allocate an entered waiver in pesewas, preserving its exact total. */
export function allocateWaiver(balances: number[], requested: number): number[] {
	if (!Number.isSafeInteger(requested) || requested < 0 || balances.some(n => !Number.isSafeInteger(n) || n < 0)) throw new Error('Invalid monetary amount');
	const total = balances.reduce((a, b) => a + b, 0);
	if (!Number.isSafeInteger(total)) throw new Error('Invalid monetary total');
	const target = Math.min(requested, total);
	if (!total) return balances.map(() => 0);
	const denominator = BigInt(total);
	const shares = balances.map((balance, index) => {
		const product = BigInt(balance) * BigInt(target);
		return { index, amount: Number(product / denominator), remainder: product % denominator };
	});
	let remaining = target - shares.reduce((sum, share) => sum + share.amount, 0);
	const ranked = [...shares].sort((a, b) => a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1);
	for (const share of ranked) { if (remaining-- <= 0) break; share.amount++; }
	return shares.map(share => share.amount);
}
