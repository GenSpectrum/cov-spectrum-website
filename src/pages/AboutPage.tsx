import styled from 'styled-components';
import React from 'react';
import { ExternalLink } from '../components/ExternalLink';
import { EmailLink } from '../components/EmailLink';

const Question = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className='w-full bg-yellow-100 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
      <h2 className='font-bold mb-2 mt-0'>{title}</h2>
      <p>{children}</p>
    </div>
  );
};

const Disclaimer = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <h2 className='font-bold mb-2 mt-0'>Disclaimer</h2>
      <div className='w-full bg-gray-100 shadow-lg mb-6 mt-4 rounded-xl p-4 dark:bg-gray-800'>
        <p>{children}</p>
      </div>
    </>
  );
};

export const AboutPage = () => {
  return (
    <div className='max-w-4xl mx-auto'>
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
      <h1>FAQ</h1>
      <Question title='What is a variant?'>
        We distinguish between two ways to specify a variant. A variant can be defined as a clade on the
        phylogenetic tree. This approach is followed by the{' '}
        <ExternalLink url='https://cov-lineages.org/'>pangolin lineages</ExternalLink> which we consider as
        "known variants." Additionally, a variant can be defined as a set of amino acid mutations. On{' '}
        <ExternalLink url='https://covariants.org/'>CoVariants</ExternalLink> and{' '}
        <ExternalLink url='https://cov-lineages.org/global_report.html'>PANGO lineages</ExternalLink> , you
        can find detailed information about variants that are currently of particular interest. Different to
        these websites, CoV-Spectrum does not only show pre-defined variants but provides tools to discover
        and analyze new variants.
      </Question>
      <Question title='Which data do you use?'>
        We use genomic data from GISAID and unreleased/not yet released sequences from the Swiss SARS-CoV-2
        Sequencing Consortium (S3C) complemented by metadata provided by the Federal Office of Public Health
        (FOPH) of Switzerland.
      </Question>
      <p></p>
      <Question title='What is the "Private Switzerland Login" and can I gain access?'>
        For Switzerland, we have some confidential data. The access can only be provided to very few people.
        Please contact us if you believe that you are eligible.
      </Question>
      <Question title='What is the "Share" button next to the plots for?'>
        You can embed all the interactive plots of CoV-Spectrum on your own website. Just click on the "Share"
        button and copy and paste the code to your page. The plots will be automatically updated whenever new
        data arrives.
      </Question>
      <Question title='Can I download the numbers behind the plots?'>
        For some of the plots, there is a button next to the plot to download the data as a CSV file.
      </Question>
      <p></p>
      <Disclaimer>
        <ul>
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
      <h2 className='font-bold mb-2 mt-0'>Contact</h2>
      <p>
        This project is developed by the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cevo'>Computational Evolution group</ExternalLink> at ETH
        Zurich. Please contact Chaoran Chen (
        <EmailLink email='chaoran.chen@bsse.ethz.ch' />) for any questions.
      </p>
    </div>
  );
};
