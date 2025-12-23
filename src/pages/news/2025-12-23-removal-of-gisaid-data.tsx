import React, { useEffect } from 'react';
import { GisaidMissingDataUpdateBanner } from '../../components/banners/GisaidMissingDataUpdateBanner';
import { GisaidFineGrainedFilteringBanner } from '../../components/banners/GisaidFineGrainedFilteringBanner';
import { GisaidRemovalBanner } from '../../components/banners/GisaidRemovalBanner';
import { Link } from 'react-router';
import { ExternalLink } from '../../components/ExternalLink';

export const RemovalOfGisaidDataPage = () => {
  useEffect(() => {
    document.title = `Removal of GISAID Data - 23 December 2025 - covSPECTRUM`;
  });

  return (
    <div className='max-w-4xl mx-auto px-4 md:px-8'>
      <h1>Removal of GISAID Data</h1>
      <div className='mb-4 text-gray-500'>23 December 2025</div>

      <p className='font-bold'>
        On December 23, 2025, we removed the GISAID-powered CoV-Spectrum instance and the underlying data.
        Going forward, the INSDC-powered instance is the only CoV-Spectrum dashboard. In what follows, we
        outline the recent developments leading to the removal of the GISAID CoV-Spectrum instance.
      </p>
      <p>
        While we have been operating an instance with data from GISAID and an instance with data from INSDC in
        parallel for many years, the GISAID instance has been the default version, available at
        cov-spectrum.org. The reason for this default was that the GISAID dataset is bigger, and, in
        particular, containing all INSDC data (as GISAID ingests the INSDC data). However, the INSDC instance
        offers additional features, such as data download or phylogeny views, which can only be offered
        because the data is open.
      </p>
      <p>
        Since Oct. 12, 2025 we have not received new data from GISAID, preventing us from providing timely
        variant information on the GISAID-powered instance. We approached GISAID about the data feed
        interruption on Oct. 22, Oct. 27, and Nov. 11 without receiving a response. We notified our users with
        a banner on cov-spectrum.org:
      </p>
      <GisaidMissingDataUpdateBanner />
      <p>
        In November, it was brought to our attention that GISAID might find our rare variant filtering
        functionality problematic. Thus we proactively – without receiving a demand from GISAID – implemented
        an update to prevent very detailed sequence filtering, aiming to resolve potential disagreements with
        GISAID and to continue the collaboration. Importantly, the rare variant filtering did at no point
        allow any relevant bulk sequence reconstruction. Our new implementation comes at the expense of
        compromising detailed rare variant analyses, which remains only possible with the INSDC-powered
        CoV-Spectrum instance. We notified our users with a banner on cov-spectrum.org:
      </p>
      <GisaidFineGrainedFilteringBanner />
      <p>We notified GISAID of this update on Nov. 12, 2025, without getting a response.</p>
      <p>
        On Dec. 15, 2025, GISAID notified us that we have to remove the GISAID-powered CoV-Spectrum instance
        due to violating the data access agreement. Essentially, GISAID disagrees with us using an API for the
        aggregated data shown on the dashboard. Of note, we transparently shared the existence of this API
        with GISAID in 2022 while not sharing the API with other users.
      </p>
      <p>We disagree with any violation of the agreements.</p>
      <p>
        While we see ourselves in service to our users who rely on CoV-Spectrum, we could not deliver on their
        needs of timely GISAID data analyses since we did not receive data for over 2 months from GISAID; thus
        we did not contest the GISAID request. We agreed to take the GISAID-powered instance offline within 4
        weeks (mail Dec. 16, 2025 to GISAID) and notified our users with a banner on cov-spectrum.org:
      </p>
      <GisaidRemovalBanner />
      <p>GISAID responded on Dec. 17, 2025 asking us to take everything down by Dec. 19, 2025.</p>
      <p>
        We worked on a smooth transition to cov-spectrum empowered by INSDC and took the GISAID-empowered
        instance down on Dec. 23, 2025.
      </p>
      <p>
        At the moment, cov-spectrum.org relies on INSDC data and additional data directly ingested from
        Germany’s Robert Koch Institut (RKI), while the generalized{' '}
        <Link to='https://genspectrum.org' className='text-active-secondary'>
          genspectrum.org
        </Link>{' '}
        instance (for more than 15 pathogens) additionally shows – if available – the restricted-use sequences
        which were shared through <ExternalLink url='https://pathoplexus.org'>Pathoplexus</ExternalLink>. Of
        note, genspectrum.org for Influenza relies exclusively on INSDC data since its launch. We aimed to
        explore the GISAID EpiFlu data in order to potentially set up a genspectrum instance, however we were
        never granted access to the GISAID EpiFlu data (despite having continuously requested access to the
        data, starting in June 2023).
      </p>
      <p>
        We are convinced that the global community needs to come together empowering researchers and public
        health stakeholders to share data for the global <em>public health benefit</em>, while ensuring that
        data generators obtain the appropriate recognition for their work. The latter implies assurance that
        data generators are not being scooped on any scientific publication (<em>scientific benefits</em>) and
        that <em>commercial benefits</em> are shared. The community needs to work together to find a
        transparent and sustainable solution for such a mutual benefit sharing.
      </p>
      <p>
        <span className='font-bold'>Acknowledgement.</span> Our thanks go to all data submitters and sequence
        databases. These efforts enabled the dashboard CoV-Spectrum to serve the community since almost 5
        years with real-time COVID-19 variant analyses, supporting public health responses.
      </p>
    </div>
  );
};
