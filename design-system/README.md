# design-system/

## Sa ki la kounye a

Yon ekspò (Calendar, Contacts, Dashboard, Help Center, Invoices,
Messages, Notifications, Products, Reports, Task/Tasks, Ui, Sign
In/Sign Up/Recover/Finish/Details) dekonprese isit la. Se yon UI kit
SaaS **jeneral** (ekran ak non an Anglè, pa Kreyòl, modil ki pa toujou
matche modil PatwonPro yo egzakteman — "Invoices"/"Messages" pa
egziste kòm modil nan `docs/CLAUDE.md`) — sèvi avè l kòm **referans
enspirasyon/layout**, pa kòm yon spec egzat pou koupe-kole.

Se **imaj (PNG/SVG)**, pa yon fichye tokens (JSON/CSS) — okenn valè
koulè/tipografi pa ka ekstraksyon otomatikman ladan l. Si w vle enpòte
yon palèt/echèl tipografi soti nan ekspò sa a nan `src/app/globals.css`,
sa mande enspeksyon manyèl (louvri chak ekran, idantifye koulè yo).
`docs/CLAUDE.md` ("Tokens visuels") rete sous verite pou tokens yo
jiskaske sa fèt eksplisitteman.

## Lè yon lòt ZIP ajoute

1. Dekonprese l isit la (`design-system/`) — pa kite yon dosye entèmedyè
   san non ("12/", elt.) ki soti nan ekspò a, aplati l dirèkteman anba
   `design-system/`.
2. Si l gen vrè tokens (JSON/CSS), pote yo nan `src/app/globals.css`
   (blòk `:root`/`@theme`) — **verifye kont `docs/CLAUDE.md` anvan**,
   paske se li ki sous verite pwodwi a.
3. Pote ikòn/asset SVG itil yo nan `src/components/icons/`.
4. Mete `docs/DESIGN_SYSTEM.md` ajou si vrè valè yo diferan de sa ki nan
   `docs/CLAUDE.md`.
