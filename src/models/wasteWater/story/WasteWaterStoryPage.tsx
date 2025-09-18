import React, { useEffect, useState } from 'react';
import { ExternalLink } from '../../../components/ExternalLink';
import { isDiscontinuedSite, WasteWaterSamplingSites } from './WasteWaterSamplingSites';
import { discontinuedSites } from '../constants';
import { FixedDateRangeSelector } from '../../../data/DateRangeSelector';
import { globalDateCache } from '../../../helpers/date-cache';
import dayjs from 'dayjs';

export const WasteWaterStoryPage = () => {
  useEffect(() => {
    document.title = `Wastewater in Switzerland - Stories - covSPECTRUM`;
  });

  return (
    <div className='px-4 md:px-8'>
      <h1>Wastewater in Switzerland</h1>
      <div className='italic'>
        by{' '}
        <ExternalLink url='https://bsse.ethz.ch/cbg/'>Computational Biology Group, ETH Zürich</ExternalLink>
      </div>
      <p>
        We analyze wastewater samples collected at different Swiss wastewater treatment plants for their
        genomic composition. Specifically, using next-generation sequencing (which is done at{' '}
        <ExternalLink url='https://fgcz.ch/'>FGCZ</ExternalLink>) we process the resulting short-read data
        with <ExternalLink url='https://cbg-ethz.github.io/V-pipe/'>V-pipe</ExternalLink> and search for
        mutations characteristic of variants of concern or under monitoring. The relative frequency of each
        signature mutation is determined, and all mutation frequencies are combined within a selected time
        window and translated into estimates of the relative prevalence of the variant in the population over
        the considered time period (see{' '}
        <ExternalLink url='https://doi.org/10.1101/2021.01.08.21249379'>
          doi:10.1101/2021.01.08.21249379
        </ExternalLink>
        {', '}
        <ExternalLink url={'https://doi.org/10.1101/2022.11.02.22281825'}>
          doi:10.1101/2022.11.02.22281825
        </ExternalLink>{' '}
        and <ExternalLink url='https://github.com/cbg-ethz/cowwid'>cowwid</ExternalLink> for more details).
      </p>
      <p>
        Detecting variants in wastewater is challenging if the RNA concentration is low, for example, due to
        low infection numbers in the catchment area of the wastewater treatment plant. Variants with very
        similar mutation profiles can also be difficult to distinguish. Estimates of the proportions of
        variants are less reliable in these situations.
      </p>
      <WasteWaterSamplingSites locationFilter={location => !isDiscontinuedSite(location)} />
      <DiscontinuedSamplingSites />
      <DataSources />
      <DataAvailability />
      <Acknowledgements />
      <Funding />
      <Contact />
    </div>
  );
};

const DiscontinuedSamplingSites = () => {
  return (
    <>
      {discontinuedSites.map((site, index) => (
        <DiscontinuedSiteSection key={index} site={site} />
      ))}
    </>
  );
};

const DiscontinuedSiteSection = ({ site }: { site: (typeof discontinuedSites)[0] }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Create a date range for the 6 months before discontinuation using the constant datetime
  const discontinuationDate = dayjs(site.discontinuedDateTime);
  const dateFrom = globalDateCache.getDayUsingDayjs(discontinuationDate.subtract(6, 'months'));
  const dateTo = globalDateCache.getDayUsingDayjs(discontinuationDate);
  const dateRangeSelector = new FixedDateRangeSelector({ dateFrom, dateTo });

  return (
    <div className='mb-4'>
      <h2
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        className='d-flex align-items-center'
      >
        <span className='me-2'>{isOpen ? '▼' : '▶'}</span>
        Locations discontinued since{site.discontinuedDate}
      </h2>
      <div className={isOpen ? 'visible' : 'collapse'}>
        <WasteWaterSamplingSites
          locationFilter={location => site.discontinuedLocations.has(location)}
          defaultDateRangeSelector={dateRangeSelector}
        />
      </div>
    </div>
  );
};

const DataSources = () => {
  return (
    <div>
      <h2>Data sources</h2>
      <p>
        Starting from 2 Nov 2024, the project is divided in two phases every year. The winter phase includes
        pooled sequencing of SARS-CoV-2, Respiratory Syncytial Virus (RSV), and Influenza A Virus (IAV). The
        summer phase includes sequencing of SARS-CoV-2 only.
      </p>
      <p>
        <ExternalLink url={'https://www.eawag.ch/en/department/sww/projects/sars-cov2-in-wastewater/'}>
          Eawag
        </ExternalLink>{' '}
        collects samples at multiple wastewater treatment plans across Switzerland. Over the course of the
        project, different locations have been covered.
      </p>
      <p>
        Since 25 Nov 2024, the following six wastewater treatment plants are sampled three times per week:
        Chur (GR), Geneva (GE), Laupen (BE), Lugano (TI), Zurich (ZH), and Basel (BS).
      </p>
      <p>
        Previously, the project covered eight additional wastewater treatment plants: Lausanne (VD), Bern
        (BE), Porrentruy (JU), Neuchâtel (NE), Solothurn (SO), Schwyz (SZ), Luzern (LU) and Altenrhein (SG).
      </p>
      <p>
        Monitoring of Luzern (LU) and Altenrhein (SG) ended on 25 Nov 2024. Monitoring of Bern (BE) ended on
        25 March 2024. Monitoring of Lausanne (VD) ended 25 Feb 2024. The monitoring of all other discontinued
        treatment plants ended on 31 Dec 2023.
      </p>
      <p>
        Previously, Microsynth AG provided samples from the wastewater treatment plants of Lausanne-Vidy (VD),
        Sierre/Noes (VS) and Porrentruy (JU), three times per week until the beginning of July 2023.
      </p>
      <p>
        The Health Department Basel-Stadt provided samples from the ProRheno AG wastewater treatment plant
        three times per week (once per week until the end of 2022).
      </p>
      <p>
        Until end of May 2022, three times a week, the Cantonal Laboratory Zurich (KLZH) provided samples that
        assess the Canton of Zurich by pooling samples from 12 plants across the canton, namely
        Zürich-Werdhölzli (also used by Eawag), Winterthur-Hard, Dietikon-Limmattal, Dübendorf-Neugut,
        Niederglatt-Fischbach, Uster, Bülach-Furt, Wetzikon-Flos, Horgen-Oberrieden, Meilen, Affoltern
        a.A.-Zwillikon, and Illnau-Mannenberg.
      </p>
    </div>
  );
};

const DataAvailability = () => {
  return (
    <div>
      <h2>Data availability</h2>
      <p>De-humanized sequencing libraries in FASTQ format for each sample are publicly available on ENA.</p>
      <p>
        Ongoing project ID:{' '}
        <ExternalLink url={'https://www.ebi.ac.uk/ena/browser/view/PRJEB85524'}>PRJEB85524</ExternalLink>.
      </p>
      <p>
        Project ID before 2 Nov 2024:{' '}
        <ExternalLink url={'https://www.ebi.ac.uk/ena/browser/view/PRJEB44932'}>PRJEB44932</ExternalLink>.
      </p>
    </div>
  );
};

const Acknowledgements = () => {
  return (
    <div>
      <h2>Acknowledgements</h2>
      <h3>
        <ExternalLink url={'https://bsse.ethz.ch/cbg'}>
          Computational Biology Group (CBG), ETH Zürich{' '}
        </ExternalLink>{' '}
        /{' '}
        <ExternalLink url={'https://www.sib.swiss/niko-beerenwinkel-group'}>
          Swiss Institute of Bioinformatics
        </ExternalLink>
      </h3>
      <Authors
        authors={
          'Ivan Topolsky, David Dreifuss, Gordon J. Köhn, Anika John, Auguste Rimaite, Pelin Burcak Icer, Lara Fuhrmann, Niko Beerenwinkel'
        }
      />
      <h3>
        <ExternalLink url={'https://bsse.ethz.ch/cevo'}>
          Computational Evolution (cEvo), ETH Zürich
        </ExternalLink>{' '}
        /{' '}
        <ExternalLink url={'https://www.sib.swiss/tanja-stadler-group'}>
          Swiss Institute of Bioinformatics
        </ExternalLink>
      </h3>
      <Authors authors={'Louis du Plessis, Tanja Stadler'} />
      <h3>
        <ExternalLink url={'https://www.nexus.ethz.ch/'}>
          NEXUS Personalized Health Technologies, ETH Zürich
        </ExternalLink>{' '}
        /{' '}
        <ExternalLink url={'https://www.sib.swiss/daniel-stekhoven-group'}>
          Swiss Institute of Bioinformatics
        </ExternalLink>
      </h3>
      <Authors authors={'Matteo Carrara, Kyra Kirschenbühler, Franziska Singer'} />
      <h3>Eawag</h3>
      <Authors
        authors={
          'Christoph Ort, Tim Julian, Lea Caduff, Charlie Gan, Seju Kang, Jolinda de Korne, Melissa Pitton, Linda Schneider, Anna Wettlauffer, Patrick Schmidhalter, Nadine Hürlimann, Nadja Widrig'
        }
      />
      <h3>Functional Genomic Center Zürich</h3>
      <Authors authors={'Catharine Aquino, Lennart Opitz, Dominika Brchnelova, Adriana Hotz'} />
      <h3>Genomic Facility Basel</h3>
      <Authors authors={'Mirjam Feldkamp, Christian Beisel'} />
      <h3>Laboratory of Environmental Chemistry EPFL</h3>
      <Authors authors={'Xavier Fernandez-Cassi, Federica Cariti, Alex Tuñas Corzón, Tamar Kohn'} />
    </div>
  );
};

const Authors = ({ authors }: { authors: string }) => {
  return <p className={'italic'}>{authors}</p>;
};

const Funding = () => {
  return (
    <div>
      <h2>Funding</h2>
      <p>Federal Office for Public Health</p>
    </div>
  );
};

const Contact = () => {
  return (
    <div>
      <h2>Contact</h2>
      <p>
        Prof. Niko Beerenwinkel, <ExternalLink url='https://bsse.ethz.ch/cbg'>ETH</ExternalLink> Zürich.
      </p>
    </div>
  );
};
