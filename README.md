# ZX

**Zcash runes that pay xStocks.**

Launchpad that etches (or imports) Zcash zRunes, permanently pairs each one to an xStock, and pays holders in those shares.

**Site:** https://zxpad.vercel.app  
**Study surface:** [zordinals.fun/zrunes](https://www.zordinals.fun/zrunes)

## What it is

Zordinals already has the Zcash half:

- Etch a zRune / launch a memecoin for **0.001 ZEC** via Noir
- **1B** (or rune supply) credited to the etcher
- **Order book** quoted in ZEC, server-matched, **1% taker**

ZX is the yield half:

1. Pair the rune to an xStock (NVDAx, AAPLx, TSLAx, SPYx, …)
2. 50% of the 1% taker fee waits in a reserve
3. Anyone cranks: ZEC → buy that xStock on Solana
4. Holders claim shares to a linked Solana wallet (balance × time)

Zcash has no VM, so the vault is not a PDA. It is a designated reserve plus a permissionless crank — same constraint ZecPad / Zordinals already live with.

## Run

```bash
cd zxpad
npm install
npm run dev
```

Open http://localhost:5190

## Pages

| Route | What |
|---|---|
| `/` | Markets — live ZEC + xStock tape, paired zRunes |
| `/launch` | Etch a rune and bind an xStock |
| `/rune/:id` | Book, trade, vault, crank, claim |
| `/portfolio` | Holdings + claimable xStocks |
| `/crank` | Permissionless ZEC → xStock buys |
| `/docs` | Mechanics and risks |

## Stack

React 19 · Vite 6 · Tailwind 4 · live Yahoo/Nasdaq + CoinGecko prices
