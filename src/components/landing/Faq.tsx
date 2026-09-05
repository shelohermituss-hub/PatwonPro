import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Èske PatwonPro mache san entènèt?",
    answer:
      "Wi. Ou ka vann, jere pwodwi, epi swiv kredi kliyan menm lè pa gen koneksyon. Done yo senkronize otomatikman lè entènèt la retabli.",
  },
  {
    question: "Ki mwayen peman li sipòte?",
    answer:
      "Kach, MonCash, ak NatCash — anplis vant a kredi pou kliyan fidèl ou yo.",
  },
  {
    question: "Èske mwen ka envite anplwaye pou ede m vann?",
    answer:
      "Wi, ou ka envite otan anplwaye ou vle pou yo ka vann nan Pwen Vant lan. Se sèlman ou, kòm pwopriyetè, ki ka jere pwodwi ak wè rapò yo.",
  },
  {
    question: "Èske done boutik mwen an sekirite?",
    answer:
      "Wi. Done chak boutik izole ak pwoteje — sèl moun ki fè pati boutik ou ka wè oswa modifye enfòmasyon li.",
  },
  {
    question: "Konbyen sa koute?",
    answer:
      "Kontakte nou apre ou fin kreye kont ou pou nou ka ede w chwazi abònman ki koresponn ak gwosè boutik ou.",
  },
];

export function Faq() {
  return (
    <section id="kesyon" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Kesyon moun poze souvan
        </h2>
      </div>

      <Accordion className="mt-10">
        {FAQS.map((faq) => (
          <AccordionItem key={faq.question} value={faq.question}>
            <AccordionTrigger className="py-4 text-base">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-text-secondary">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
