import React, { useEffect } from 'react';
import { ExternalLink } from '../components/ExternalLink';
import { EmailLink } from '../components/EmailLink';

const Question = ({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='w-full bg-yellow-100 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
      <h2 className='font-bold mb-2 mt-0'>{title}</h2>
      <p>{children}</p>
    </div>
  );
};

const Component = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className='w-full bg-blue-50 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
      <h2 className='font-bold mb-2 mt-0'>{title}</h2>
      <p>{children}</p>
    </div>
  );
};

const Disclaimer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <h1>Disclaimer</h1>
      <div className='w-full bg-gray-100 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
        <p>{children}</p>
      </div>
    </>
  );
};

export const AboutPage = () => {
  useEffect(() => {
    document.title = `About - covSPECTRUM`;
  });
  return (
    <div className='max-w-4xl mx-auto px-4 md:px-8'>
      <h1>CoV-Spectrum</h1>
      <p>
        Explore up-to-date genome data and monitor variants of SARS-CoV-2! CoV-Spectrum is a fully interactive
        platform aiming to help scientists investigate known variants as well as identifying new ones. It is
        in an early stage of development. Suggestions for improvements, bug reports as well as active
        contributions are highly welcome. Please create an issue in our{' '}
        <ExternalLink url='https://github.com/cevo-public/cov-spectrum-website'>
          Github repository
        </ExternalLink>{' '}
        or send an email to <EmailLink email='chaoran.chen@bsse.ethz.ch' />.
      </p>
      <p>If you would like to reference CoV-Spectrum in scientific works, please cite our publication:</p>
      <div className='p-4 mt-4 mb-6 bg-gray-100 rounded-xl'>
        Chen, C., Nadeau, S., Yared, M., Voinov, P., Ning, X., Roemer, C. & Stadler, T. "CoV-Spectrum:
        Analysis of globally shared SARS-CoV-2 data to Identify and Characterize New Variants" Bioinformatics
        (2021); doi:{' '}
        <ExternalLink url='https://doi.org/10.1093/bioinformatics/btab856'>
          10.1093/bioinformatics/btab856
        </ExternalLink>
        .
      </div>
      <h1 id='faq'>FAQ</h1>
      <Question title='What is a variant?' id='faq-variant'>
        We distinguish between two ways to specify a variant. A variant can be defined as a clade on the
        phylogenetic tree. This approach is followed by the{' '}
        <ExternalLink url='https://cov-lineages.org/'>Pango lineages</ExternalLink>. Additionally, a variant
        can be defined as a set of amino acid mutations. On{' '}
        <ExternalLink url='https://covariants.org/'>CoVariants</ExternalLink> and{' '}
        <ExternalLink url='https://cov-lineages.org/global_report.html'>Cov-Lineages</ExternalLink> , you can
        find detailed information about variants that are currently of particular interest. Different to these
        websites, CoV-Spectrum does not only show pre-defined variants but provides tools to discover and
        analyze new variants.
      </Question>
      <Question title='Which data do you use?' id='faq-data-sources'>
        We use genomic data from GISAID and unreleased/not yet released sequences from the Swiss SARS-CoV-2
        Sequencing Consortium (S3C) complemented by metadata provided by the Federal Office of Public Health
        (FOPH) of Switzerland.
      </Question>
      <Question title='How can I search a variant?' id='faq-search-variants'>
        <p>
          CoV-Spectrum supports a wide range of search queries. First of all,{' '}
          <b>the search is case-insensitive</b>.
        </p>
        <p>
          <b>Pango lineages:</b> You can search for a single Pango lineage (e.g., B.1.617) or include the
          sub-lineages by adding a "*" at the end (e.g., B.1.617*). The search is aware of Pango lineage
          aliases (i.e., B.1.617* includes B.1.617, B.1.617.1, B.1.617.2, but also AY.1, AY.2, ...). It is
          possible to enter the "full name" instead of an alias (e.g., B.1.617.2.1 instead of AY.1).
        </p>
        <p>
          <b>Amino acid mutations:</b> An amino acid (AA) mutation is encoded as the name of the gene,
          followed by a colon, optionally the base in the reference genome, the position on the amino acid
          sequence, and optionally the new base or a special character.
        </p>
        <p>
          Formally: &lt;gene&gt;:[&lt;reference AA&gt;]&lt;position&gt;[&lt;new AA&gt;|&lt;special
          character&gt;] - where:
          <ul className='list-disc'>
            <li>
              &lt;gene&gt; - one of the following: E, M, N, ORF1a, ORF1b, ORF3a, ORF6, ORF7a, ORF7b, ORF8,
              ORF9b, S
            </li>
            <li>&lt;reference AA&gt; - this is optional and will be ignored</li>
            <li>
              &lt;position&gt; - an integer specifying the position on the amino acid sequence of the
              respective gene, it starts with 1.
            </li>
            <li>&lt;new AA&gt; - the AA at the specified position</li>
            <li>
              &lt;special character&gt; - one of the following: X (=unknown), - (=deletion), * (=stop codon),
              . (=not mutated)
            </li>
          </ul>
        </p>
        <p>
          Examples:
          <ul className='list-disc'>
            <li>
              S:N501Y: the reference genome has a N at the 501st position on the S-gene, and this query is
              looking for sequences which has instead a Y at that position
            </li>
            <li>S:501Y: this is equivalent to the previous one</li>
            <li>
              S:501: the 501st position is mutated; in other words, it does not have the same AA as the
              reference genome and it is not unknown
            </li>
            <li>S:501-: the 501st position is deleted</li>
            <li>
              S:501.: the 501st position is not mutated, i.e., it has the same AA as the reference genome
            </li>
            <li>S:501X: the 501st position is unknown</li>
          </ul>
        </p>
        <p>
          <b>Nucleotide mutations:</b>
        </p>
        <p>
          Formally: &lt;reference base&gt;]&lt;position&gt;[&lt;new base&gt;|&lt;special character&gt;] -
          where:
          <ul className='list-disc'>
            <li>&lt;reference base&gt; - this is optional and will be ignored</li>
            <li>
              &lt;position&gt; - an integer specifying the position on the nucleotide sequence of the
              respective gene, it starts with 1.
            </li>
            <li>
              &lt;special character&gt; - one of the following: N (=unknown), - (=deletion), . (=not mutated)
            </li>
          </ul>
        </p>
        <p>
          Examples:
          <ul className='list-disc'>
            <li>
              A23403G: the reference genome has an A at the 23403th position, and this query is looking for
              sequences which has instead a G at that position
            </li>
            <li>23403G: this is equivalent to the previous one</li>
            <li>
              23403: the 23403th position is mutated; in other words, it does not have the same base as the
              reference genome and it is not unknown
            </li>
            <li>23403: the 23403th position is deleted</li>
            <li>
              23403.: the 23403th position is not mutated, i.e., it has the same base as the reference genome
            </li>
            <li>23403-: the 23403th position is deleted</li>
            <li>23403N: the 23403th position is unknown</li>
          </ul>
        </p>
        <p>
          We will soon support <b>Nextstrain and GISAID clades</b>. Follow{' '}
          <ExternalLink url='https://github.com/cevo-public/cov-spectrum-website/issues/274'>
            #274 in our Github repository
          </ExternalLink>{' '}
          to get notifications about the progress.
        </p>
      </Question>
      <Question title='What is the "Login" and can I gain access?' id='faq-login'>
        For Switzerland, we have some confidential data. The access can only be provided to very few people.
        Please contact us if you believe that you are eligible.
      </Question>
      <Question title='Can I use the plots on my own website?' id='faq-embed-widget'>
        Yes! You can embed all the interactive plots of CoV-Spectrum on your own website. Just click on the
        "Export" and then on the "Embed widget" button and copy and paste the code to your page. The plot will
        then be embedded as an iframe. It will be automatically updated whenever new data arrives.
      </Question>
      <Question title='Can I download the numbers behind the plots?' id='faq-download-data'>
        Click on the "Export" button next to the plots and then on "Download CSV" to get the data as a CSV
        file.
      </Question>
      <h1 id='components'>Components</h1>
      <Component title='Known variants list'>
        <p>
          <img
            src='/img/about-known-variants-list.png'
            alt='The known variants list component'
            className='w-full max-w-xl'
          />
        </p>
        <p>
          The known variants are variants defined by the Pango lineages. With the search (1), it is possible
          to search for a Pango lineage. To include the sub-lineages of a Pango lineage, write a "*" at the
          end. For example, "B.1.*" and "B.1*" will use all samples that were classified as "B.1" or as a
          Pango lineage that starts with "B.1.".
        </p>
        <p>
          In (2), we show a preview of 12 known variants for the past three months with sequencing data.
          Currently, the first 8 are the WHO variants of concerns and are fixed for all countries. The
          remaining 4 are the variants with the most sequenced samples in the past 3 months. The proportion
          number in the preview plots (3) is the prevalence of the variant in the most recent 14 days for
          which sequencing data are available in the selected country.
        </p>
      </Component>

      <Disclaimer>
        <ul className='list-disc'>
          <li>
            Although ETH Zurich takes all possible care to ensure the correctness of published information, no
            warranty can be accepted regarding the correctness, accuracy, uptodateness, reliability and
            completeness of the content of this information.
          </li>
          <li>
            Liability claims against ETH Zurich because of tangible or intangible damage arising from
            accessing, using or not using the published information, through misuse of the connection or as a
            result of technical breakdowns are excluded.
          </li>
        </ul>
      </Disclaimer>

      <h1 id='acknowledgements'>Acknowlegements</h1>
      <Component title='FOPH and S3C'>
        We gratefully acknowledge the{' '}
        <ExternalLink url='https://www.bag.admin.ch/'>Federal Office of Public Health (FOPH)</ExternalLink>{' '}
        and all members of the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cevo/research/sars-cov-2/swiss-sequencing-consortium---viollier.html'>
          Swiss SARS-CoV-2 Sequencing Consortium (S3C)
        </ExternalLink>{' '}
        for providing sequence and metadata for Switzerland.
      </Component>

      <Component title='GISAID'>
        We gratefully acknowledge all data contributors, i.e. the Authors and their Originating laboratories
        responsible for obtaining the specimens, and their Submitting laboratories for generating the genetic
        sequence and metadata and sharing via the GISAID Initiative<sup>1</sup> on which this research is
        based.
      </Component>
      <p>
        <sup>1</sup> Elbe, S., and Buckland-Merrett, G. (2017) Data, disease and diplomacy: GISAID’s
        innovative contribution to global health. <i>Global Challenges</i>, 1:33-46. DOI:{' '}
        <ExternalLink url='https://dx.doi.org/10.1002/gch2.1018'>10.1002/gch2.1018</ExternalLink>, PMCID:{' '}
        <ExternalLink url='https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6607375/'>31565258</ExternalLink>
      </p>

      <h1 className='font-bold mb-2 mt-4' id='contact'>
        Contact
      </h1>
      <p>
        This project is developed by the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cevo'>Computational Evolution group</ExternalLink> at ETH
        Zurich. For general questions, please contact Chaoran Chen (
        <EmailLink email='chaoran.chen@bsse.ethz.ch' />
        ). For media requests, please reach out to ETH Zurich Media Relations (
        <EmailLink email='mediarelations@hk.ethz.ch' />
        ).
      </p>
    </div>
  );
};
