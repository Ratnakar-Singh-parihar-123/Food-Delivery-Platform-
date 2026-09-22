import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronDown,
  HelpCircle,
  Mail,
  MessageCircle,
  Sparkles,
} from "lucide-react";

import SectionHeading from "../../components/common/SectionHeading";
import Button from "../../components/common/Button";
import { faqData } from "../../data/faq";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
    },
  },
};

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFAQ = (index) => {
    setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-[#fffaf6] py-20 sm:py-24 lg:py-28"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -left-52 top-20 h-[420px] w-[420px] rounded-full bg-orange-200/40 blur-3xl" />

        <div className="absolute -right-52 bottom-0 h-[420px] w-[420px] rounded-full bg-red-200/30 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.07)_1px,transparent_1px)] bg-[size:28px_28px]" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mb-4"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
            <Sparkles className="w-4 h-4" />
            We are here to help
          </span>
        </motion.div>

        <SectionHeading
          title="Frequently Asked Questions"
          subtitle="Everything you need to know about ordering food, payments, deliveries and using our platform."
        />

        <div className="mt-14 grid items-start gap-8 lg:mt-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
          {/* Left support panel */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,0.22)] sm:p-8 lg:sticky lg:top-24"
          >
            <div className="absolute w-56 h-56 rounded-full pointer-events-none -right-16 -top-20 bg-orange-500/20 blur-3xl" />

            <div className="absolute w-56 h-56 rounded-full pointer-events-none -bottom-20 -left-16 bg-red-500/15 blur-3xl" />

            <div className="relative">
              <span className="flex items-center justify-center shadow-lg h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 shadow-orange-500/25">
                <HelpCircle className="h-7 w-7" />
              </span>

              <h3 className="mt-6 text-2xl font-extrabold">
                Still have questions?
              </h3>

              <p className="mt-3 text-sm leading-6 text-gray-400">
                Can&apos;t find the answer you&apos;re looking for? Our support
                team is ready to help you.
              </p>

              <div className="space-y-3 mt-7">
                <a
                  href="#contact"
                  className="flex items-center gap-3 p-4 transition-colors border group rounded-2xl border-white/10 bg-white/5 backdrop-blur hover:bg-white/10"
                >
                  <span className="flex items-center justify-center w-10 h-10 text-orange-400 shrink-0 rounded-xl bg-orange-500/15">
                    <MessageCircle className="w-5 h-5" />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold">
                      Chat with support
                    </span>

                    <span className="mt-0.5 block text-xs text-gray-500">
                      Usually replies within minutes
                    </span>
                  </span>

                  <ArrowRight className="w-4 h-4 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-orange-400" />
                </a>

                <a
                  href="mailto:support@example.com"
                  className="flex items-center gap-3 p-4 transition-colors border group rounded-2xl border-white/10 bg-white/5 backdrop-blur hover:bg-white/10"
                >
                  <span className="flex items-center justify-center w-10 h-10 text-green-400 shrink-0 rounded-xl bg-green-500/15">
                    <Mail className="w-5 h-5" />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold">
                      Send us an email
                    </span>

                    <span className="mt-0.5 block truncate text-xs text-gray-500">
                      support@example.com
                    </span>
                  </span>

                  <ArrowRight className="w-4 h-4 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-green-400" />
                </a>
              </div>

              <div className="pt-6 border-t mt-7 border-white/10">
                <p className="text-xs leading-5 text-gray-500">
                  Support available daily
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  9:00 AM – 10:00 PM
                </p>
              </div>
            </div>
          </motion.aside>

          {/* FAQ accordion */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="space-y-4"
          >
            {faqData.map((item, index) => {
              const isOpen = openIndex === index;
              const buttonId = `faq-button-${index}`;
              const panelId = `faq-panel-${index}`;

              return (
                <motion.article
                  key={item.id || item.question || index}
                  variants={itemVariants}
                  layout
                  className={`overflow-hidden rounded-[22px] border bg-white transition-all duration-300 ${
                    isOpen
                      ? "border-orange-200 shadow-[0_16px_45px_rgba(249,115,22,0.12)]"
                      : "border-gray-200/80 shadow-sm hover:border-orange-200 hover:shadow-md"
                  }`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleFAQ(index)}
                    className="flex items-center w-full gap-4 px-4 py-4 text-left group sm:px-6 sm:py-5"
                  >
                    {/* Number */}
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold transition-all duration-300 ${
                        isOpen
                          ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                          : "bg-orange-50 text-orange-500 group-hover:bg-orange-100"
                      }`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {/* Question */}
                    <span
                      className={`min-w-0 flex-1 text-sm font-bold leading-6 transition-colors sm:text-base ${
                        isOpen
                          ? "text-orange-600"
                          : "text-gray-800 group-hover:text-orange-600"
                      }`}
                    >
                      {item.question}
                    </span>

                    {/* Arrow */}
                    <motion.span
                      animate={{
                        rotate: isOpen ? 180 : 0,
                      }}
                      transition={{
                        duration: 0.25,
                      }}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-500 group-hover:bg-orange-50 group-hover:text-orange-500"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{
                          height: 0,
                          opacity: 0,
                        }}
                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}
                        exit={{
                          height: 0,
                          opacity: 0,
                        }}
                        transition={{
                          height: {
                            duration: 0.3,
                            ease: "easeInOut",
                          },
                          opacity: {
                            duration: 0.2,
                          },
                        }}
                        className="overflow-hidden"
                      >
                        <div className="ml-[72px] border-t border-dashed border-orange-100 px-0 py-5 pr-5 sm:ml-[88px] sm:pr-8">
                          <motion.p
                            initial={{ y: -8 }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.25 }}
                            className="text-sm leading-7 text-gray-500"
                          >
                            {item.answer}
                          </motion.p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}

            {/* Bottom contact CTA */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-col items-center justify-between gap-4 rounded-[22px] border border-dashed border-orange-200 bg-orange-50/70 p-5 text-center sm:flex-row sm:text-left"
            >
              <div>
                <p className="text-sm font-extrabold text-gray-900">
                  Didn&apos;t find your answer?
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Send your question and our team will help you.
                </p>
              </div>

              <Button
                variant="primary"
                className="group flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm shadow-lg shadow-orange-500/20"
              >
                Contact us
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
