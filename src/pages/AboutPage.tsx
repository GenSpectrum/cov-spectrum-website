import React, { useEffect } from 'react';
import { ExternalLink } from '../components/ExternalLink';
import { EmailLink } from '../components/EmailLink';
import { InternalLink } from '../components/InternalLink';

const Question = ({ title, id, children }: { title: string; id?: string; children: React.ReactNode }) => {
  return (
    <div id={id} className='w-full bg-yellow-100 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-200'>
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
        platform aiming to help scientists investigate known variants as well as identifying new ones.
        Suggestions for improvements, bug reports as well as active contributions are highly welcome. Please
        create an issue in our{' '}
        <ExternalLink url='https://github.com/cevo-public/cov-spectrum-website'>
          Github repository
        </ExternalLink>{' '}
        or send an email to <EmailLink email='chaoran.chen@bsse.ethz.ch' />.
      </p>
      <p>
        CoV-Spectrum uses the{' '}
        <ExternalLink url='https://github.com/cevo-public/LAPIS'>LAPIS API</ExternalLink> to filter and
        aggregate the genomic data. An instance of LAPIS that uses the data from GenBank is openly available,
        please find the documentation{' '}
        <ExternalLink url='https://lapis-docs.readthedocs.io/'>here</ExternalLink>.
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
        can be defined as a set of (amino acid or nucleotide) mutations. On{' '}
        <ExternalLink url='https://covariants.org/'>CoVariants</ExternalLink> and{' '}
        <ExternalLink url='https://cov-lineages.org/global_report.html'>Cov-Lineages</ExternalLink> , you can
        find detailed information about variants that are currently of particular interest. Different to these
        websites, CoV-Spectrum does not only show pre-defined variants but provides tools to discover and
        analyze new variants.
      </Question>
      <Question title='Which data do you use?' id='faq-data-sources'>
        We offer two instances of CoV-Spectrum On{' '}
        <ExternalLink url='https://cov-spectrum.org'>cov-spectrum.org</ExternalLink>, we use genomic data from
        GISAID. On <ExternalLink url='https://open.cov-spectrum.org'>open.cov-spectrum.org</ExternalLink>, we
        use the data from GenBank which is fully open. The API that we use for the GenBank instance is openly
        available and can be used for other projects (
        <ExternalLink url='https://lapis-docs.readthedocs.io/'>API documentation</ExternalLink>).
      </Question>
      <Question title='How do you determine the Pango lineages?' id='faq-pango-lineage-classifiers'>
        <p>
          There are several classifiers to determine the Pango lineage of a sequence. CoV-Spectrum uses two
          different classifiers:{' '}
          <ExternalLink url='https://cov-lineages.org/resources/pangolin.html'>pangolin</ExternalLink> and{' '}
          <ExternalLink url='https://clades.nextstrain.org/'>Nextclade</ExternalLink>. The default is
          pangolin: that means that the search query "BA.5" finds sequences that pangolin has classified as
          "BA.5". Nextclade classifications are explicitly labelled: e.g. as "BA.5 (Nextclade)".
        </p>
        <p>
          <b>
            At the moment, we recommend the usage of Nextclade because (due to technical reasons) we update
            the Nextclade classifier more regularly. Especially newly designated lineages are often first
            available in the Nextclade mode.
          </b>
        </p>
      </Question>
      <Question title='How can I search a variant?' id='faq-search-variants'>
        <p>
          CoV-Spectrum supports a wide range of search queries. The following sections presents search options
          of the basic search bar. For information on the <b>advanced search</b>, please read{' '}
          <InternalLink path='#advanced-search'>the question box below</InternalLink>.
        </p>
        <div className='border-solid border border-gray-500 p-2 bg-white mx-6 my-2'>
          <img src='/img/search-example.png' alt='Search bar with example values' />
        </div>
        <p>
          <b>Pango lineages:</b> You can search for a single Pango lineage (e.g., B.1.617) or include the
          sub-lineages by adding a "*" at the end (e.g., B.1.617*). The search is aware of Pango lineage
          aliases (i.e., B.1.617* includes B.1.617, B.1.617.1, B.1.617.2, but also AY.1, AY.2, ...). It is
          possible to enter the "full name" instead of an alias (e.g., B.1.617.2.1 instead of AY.1).
        </p>
        <p>
          <b>Amino acid substitutions and deletions:</b> An amino acid (AA) mutation is encoded as the name of
          the gene, followed by a colon, optionally the base in the reference genome, the position on the
          amino acid sequence, and optionally the new base or a special character.
        </p>
        <p>
          Examples:
          <ul className='list-disc ml-6'>
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
          <b>Nucleotide substitutions and deletions:</b>
        </p>
        <p>
          Examples:
          <ul className='list-disc ml-6'>
            <li>
              A23403G: the reference genome has an A at the 23403th position, and this query is looking for
              sequences which has instead a G at that position
            </li>
            <li>23403G: this is equivalent to the previous one</li>
            <li>
              23403: the 23403th position is mutated; in other words, it does not have the same base as the
              reference genome and it is not unknown
            </li>
            <li>
              23403.: the 23403th position is not mutated, i.e., it has the same base as the reference genome
            </li>
            <li>23403-: the 23403th position is deleted</li>
            <li>23403N: the 23403th position is unknown</li>
          </ul>
        </p>
        <p>
          <b>Amino acid insertions:</b> CoV-Spectrum supports insertion queries that contain wildcards ("?").
        </p>
        <p>
          Examples:
          <ul className='list-disc ml-6'>
            <li>
              ins_S:214:EPE: the spike gene has an insertion of exactly "EPE" between the positions 214 and
              215
            </li>
            <li>
              ins_S:214:?EP?: the spike gene has an insertion of "EP" between the positions 214 and 215 but
              possibly also other AAs. I.e., a sequence with an insertion of "EPE" is also going to be
              matched.
            </li>
            <li>
              ins_S:214:?: the spike gene has any (but at least one) insertion between the positions 214 and
              215
            </li>
          </ul>
        </p>
        <p>
          <b>Nucleotide insertions:</b>
        </p>
        <p>
          Examples:
          <ul className='list-disc ml-6'>
            <li>
              ins_22204:GAG: the sequence has an insertion of exactly "GAG" between the positions 22204 and
              22205
            </li>
            <li>ins_22204:?GAG?GAA?: you can for sure guess what it means ;-)</li>
          </ul>
        </p>
      </Question>
      <Question title='How does the advanced search work?' id='advanced-search'>
        <p>
          The advanced search supports Boolean logic. Expressions can be connected with & (and), | (or) and !
          (not). Parentheses ( and ) can be used to define the order of the operations. Further, there is a
          special syntax to match sequences for which at least or exactly n out of a list of expressions are
          fulfilled.
        </p>
        <p>
          <b>Examples:</b>
        </p>
        <p>
          Get the sequences with the nucleotide mutation 300G, without a deletion at position 400 and either
          the AA change S:123T or the AA change S:234A:
        </p>
        <p className='border-solid border border-gray-200 p-2 mx-2 my-2 bg-white rounded-lg font-mono'>
          300G & !400- & (S:123T | S:234A)
        </p>
        <p>Get the sequences with at least 3 out of five mutations:</p>
        <p className='border-solid border border-gray-200 p-2 mx-2 my-2 bg-white rounded-lg font-mono'>
          [3-of: 123A, 234T, S:345-, ORF1a:456K, ORF7:567-]
        </p>
        <p>Get the sequences that fulfill exactly 2 out of 4 conditions:</p>
        <p className='border-solid border border-gray-200 p-2 mx-2 my-2 bg-white rounded-lg font-mono'>
          [exactly-2-of: 123A & 234T, !234T, S:345- | S:346-, [2-of: 222T, 333G, 444A, 555C]]
        </p>
        <p>Filter sequences by Pango lineage, Pango lineage as called by Nextclade and Nextstrain clade:</p>
        <p className='border-solid border border-gray-200 p-2 mx-2 my-2 bg-white rounded-lg font-mono'>
          BA.5* | nextcladePangoLineage:BA.5* | nextstrainClade:22B
        </p>
        <p>Get the sequences that have the insertion "ins_S:214:EPE?" and are not BA.1:</p>
        <p className='border-solid border border-gray-200 p-2 mx-2 my-2 bg-white rounded-lg font-mono'>
          ins_S:214:EPE? & !BA.1*
        </p>
      </Question>
      <Question title='Can I get "publication-ready" figures?' id='faq-publication-ready-figures'>
        Yes - at least for some plots! Click on the "Export" button and then on "Download PDF/PNG/SVG". This
        will produce a ggplot2-generated plot with title and legends. This features is not available for every
        plot, yet, but we plan to support more.
      </Question>
      <Question title='Can I download the numbers behind the plots?' id='faq-download-data'>
        Click on the "Export" button next to the plots and then on "Download CSV" to get the data as a CSV
        file.
      </Question>

      <Disclaimer>
        <ul className='list-disc ml-6'>
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

      <h1 id='acknowledgements'>Acknowledgements</h1>
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
      <Component title='GenBank and ENA'>
        We gratefully acknowledge all data contributors that share genetic sequences and metadata openly
        through <ExternalLink url='https://www.ncbi.nlm.nih.gov/genbank/'>GenBank</ExternalLink> and the{' '}
        <ExternalLink url='https://www.ebi.ac.uk/ena/browser/home'>
          European Nucleotide Archive (ENA)
        </ExternalLink>
        .
      </Component>

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
