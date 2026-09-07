import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQAccordion = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="divide-y divide-earth-900/10 rounded-3xl border border-earth-900/10 bg-white">

      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div key={faq.question}>

            <button
              type="button"
              onClick={() =>
                setOpenIndex(isOpen ? null : index)
              }
              className="flex w-full items-center justify-between gap-6 p-6 text-left sm:p-7"
              aria-expanded={isOpen}
            >

              <span className="font-display text-lg font-semibold text-earth-900 sm:text-xl">
                {faq.question}
              </span>

              <ChevronDown
                size={20}
                className={`
                  shrink-0 text-earth-700/50
                  transition-transform duration-300
                  ${isOpen ? "rotate-180" : ""}
                `}
              />

            </button>

            <div
              className={`
                grid transition-all duration-300
                ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }
              `}
            >
              <div className="overflow-hidden">
                <p className="px-6 pb-6 text-sm leading-7 text-earth-700/65 sm:px-7 sm:pb-7">
                  {faq.answer}
                </p>
              </div>
            </div>

          </div>
        );
      })}

    </div>
  );
};

export default FAQAccordion;