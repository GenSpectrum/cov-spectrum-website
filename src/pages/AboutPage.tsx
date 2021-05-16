import styled from 'styled-components';
import React from 'react';
import { ExternalLink } from '../components/ExternalLink';
import { EmailLink } from '../components/EmailLink';

const questionClasses = 'font-bold mb-2 mt-0';
const cardClasses = 'w-full bg-yellow-100 shadow-lg mb-6 mt-4 rounded-xl p-4 bg-white dark:bg-gray-800';

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
      <div className={cardClasses}>
        <h3 className={questionClasses}>What is a variant?</h3>
        <p>
          We distinguish between two ways to specify a variant. A variant can be defined as a clade on the
          phylogenetic tree. This approach is followed by the{' '}
          <ExternalLink url='https://cov-lineages.org/'>pangolin lineages</ExternalLink> which we consider as
          "known variants." Additionally, a variant can be defined as a set of amino acid mutations. On{' '}
          <ExternalLink url='https://covariants.org/'>CoVariants</ExternalLink> and{' '}
          <ExternalLink url='https://cov-lineages.org/global_report.html'>PANGO lineages</ExternalLink> , you
          can find detailed information about variants that are currently of particular interest. Different to
          these websites, CoV-Spectrum does not only show pre-defined variants but provides tools to discover
          and analyze new variants.
        </p>
      </div>
      <div className={cardClasses}>
        <h3 className={questionClasses}>Which data do you use?</h3>
        <p>
          We use genomic data from GISAID and unreleased/not yet released sequences from the Swiss SARS-CoV-2
          Sequencing Consortium (S3C) complemented by metadata provided by the Federal Office of Public Health
          (FOPH) of Switzerland.
        </p>
      </div>
      <div className={cardClasses}>
        <h3 className={questionClasses}>What is the "Login" and can I gain access?</h3>
        For Switzerland, we have some confidential data. The access can only be provided to very few people.
        Please contact us if you believe that you are eligible.
      </div>

      <div className={cardClasses}>
        <h3 className={questionClasses}>What are the "Share" buttons next to the plots for?</h3>
        You can embed all the interactive plots of CoV-Spectrum on your own website. Just click on the "Share"
        button and copy and paste the code to your page. The plots will be automatically updated whenever new
        data arrives.
      </div>

      <div className={cardClasses}>
        <h3 className={questionClasses}>Can I download the numbers behind the plots?</h3>
        <p>For some of the plots, there is a button next to the plot to download the data as a CSV file.</p>
      </div>
      <h1>Contact</h1>
      <p>
        This project is developed by the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cevo'>Computational Evolution group</ExternalLink> at ETH
        Zurich. Please contact Chaoran Chen (
        <EmailLink email='chaoran.chen@bsse.ethz.ch' />) for any questions.
      </p>
    </div>
  );
};
