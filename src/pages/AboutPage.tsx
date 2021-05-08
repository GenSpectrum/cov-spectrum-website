import styled from 'styled-components';
import React from 'react';
import { ExternalLink } from '../components/ExternalLink';
import { EmailLink } from '../components/EmailLink';

const Wrapper = styled.div`
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
`;

const Question = styled.div`
  font-weight: bold;
  margin-top: 20px;
`;

export const AboutPage = () => {
  return (
    <Wrapper>
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
      <h2>FAQ</h2>
      <Question>What is a variant?</Question>
      <p>
        We define a variant as a set of amino acid mutations. On{' '}
        <ExternalLink url='https://covariants.org/'>CoVariants</ExternalLink> and{' '}
        <ExternalLink url='https://cov-lineages.org/global_report.html'>PANGO lineages</ExternalLink> , you
        can find detailed information about variants that are currently of particular interest. Different to
        these websites, CoV-Spectrum does not only show pre-defined variants but provides tools to discover
        and analyze new variants.
      </p>
      <Question>Which data do you use?</Question>
      <p>
        For the public part of the website, we use data from GISAID and unreleased/not yet released sequences
        from the Swiss SARS-CoV-2 Sequencing Consortium (S3C). For the private part (see below), we provide an
        additional set of metadata for sequences from Switzerland.
      </p>
      <Question>What is the "Private Switzerland Login" and can I gain access?</Question>
      For Switzerland, we have some confidential data. The access can only be provided to very few people.
      Please contact us if you believe that you are eligible.
      <Question>What is the "Share" button next to the plots for?</Question>
      You can embed all the interactive plots of CoV-Spectrum on your own website. Just click on the "Share"
      button and copy and paste the code to your page. The plots will be automatically updated whenever new
      data arrives.
      <Question>Can I get the numbers behind the plots in a machine-readable format?</Question>
      <p>
        Yes! We offer an open API and will try to make as much data public and easily accessible as we are
        allowed to. A documentation will be released soon. Please contact us if you would like to use it in
        the meantime.
      </p>
      <h2>Contact</h2>
      <p>
        This project is developed by the{' '}
        <ExternalLink url='https://bsse.ethz.ch/cevo'>Computational Evolution group</ExternalLink> at ETH
        Zurich. Please contact Chaoran Chen (
        <EmailLink email='chaoran.chen@bsse.ethz.ch' />) for any questions.
      </p>
    </Wrapper>
  );
};
