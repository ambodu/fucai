'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const components: Components = {
  h1: ({ children }) => (
    <div className="text-base font-bold text-[#1d1d1f] mt-4 mb-2">{children}</div>
  ),
  h2: ({ children }) => (
    <div className="text-base font-semibold text-[#1d1d1f] mt-4 mb-2">{children}</div>
  ),
  h3: ({ children }) => (
    <div className="text-[14px] font-semibold text-[#1d1d1f] mt-3 mb-1.5">{children}</div>
  ),
  p: ({ children }) => <p className="mt-2 first:mt-0">{children}</p>,
  strong: ({ children }) => <strong className="text-[#1d1d1f]">{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  code: ({ className, children, ...props }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block text-[12px] leading-relaxed" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="px-1 py-0.5 bg-[#f5f5f7] rounded text-[12px] text-[#E13C39]" {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-[#1d1d1f] text-[#f5f5f7] rounded-lg p-3 my-2 overflow-x-auto text-[12px] leading-relaxed">
      {children}
    </pre>
  ),
  ul: ({ children }) => <ul className="space-y-0.5 my-1 ml-1">{children}</ul>,
  ol: ({ children }) => <ol className="space-y-0.5 my-1 list-decimal ml-5">{children}</ol>,
  li: ({ children }) => (
    <li className="my-0.5">{children}</li>
  ),
  hr: () => <hr className="border-[#e5e5ea] my-3" />,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-[#E13C39]/40 pl-3 my-2 text-[#6e6e73]">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2 -mx-1">
      <table className="w-full text-[12px] border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-[#e5e5ea]/50">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-[#e5e5ea]/60">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1.5 text-left font-semibold text-[#1d1d1f] whitespace-nowrap">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1.5 text-[#1d1d1f] whitespace-nowrap">{children}</td>
  ),
};

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="prose-sm">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
