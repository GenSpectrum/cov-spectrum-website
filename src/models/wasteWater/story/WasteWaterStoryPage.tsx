import React, { useEffect } from 'react';
import { ExternalLink } from '../../../components/ExternalLink';
import { WasteWaterSamplingSites } from './WasteWaterSamplingSites';

export const WasteWaterStoryPage = () => {
  useEffect(() => {
    document.title = `Wastewater in Switzerland - Stories - covSPECTRUM`;
  });

  return (
    <div className='px-4 md:px-8'>
      <h1>Wastewater in Switzerland</h1>
      <div className='italic'>
        by{' '}
        <ExternalLink url='https://bsse.ethz.ch/cbg/'>Computational Biology Group, ETH Zurich</ExternalLink>
      </div>
      <p>
        We analyze wastewater samples collected at different Swiss wastewater treatment plants ( see data
        sources below) using next-generation sequencing (done by{' '}
        <ExternalLink url='https://fgcz.ch/'>FGCZ</ExternalLink>), process the resulting short-read data with{' '}
        <ExternalLink url='https://cbg-ethz.github.io/V-pipe/'>V-pipe</ExternalLink>, and search for mutations
        characteristic of several variants of concern. The relative frequency of each signature mutation is
        determined, and all frequencies are combined per day, which provides an estimate of the relative
        prevalence of the variant in the population. Some variants have specific signature mutations that
        co-occur on the same fragment. Amplicons with such co-occurrences are included in the heatmaps of the
        wastewater data displayed on covSpectrum (see{' '}
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
        low infection numbers in the catchment area of the wastewater treatment plant. Estimates of the
        proportions of variants are less reliable in this situation.
      </p>
      <WasteWaterSamplingSites />
      <Viloca />
      <DataSources />
      <DataAvailability />
      <VideoPresentation />
      <Acknowledgements />
      <Funding />
      <Contact />
    </div>
  );
};

const Viloca = () => {
  return (
    <div>
      <h2>Potential drug resistance mutations in wastewater in Switzerland</h2>
      <p>
        We are analyzing the Swiss wastewater samples to detect the presence of potential drug resistance
        mutations. Specifically, we are focusing on identifying mutations that have the potential to cause
        resistance to Nirmatrelvir and Remdesivir. The mutations in the sites of interest are visualized in a
        heatmap, which indicates the frequency of the mutation with color shading ranging from light (minimum:
        0) to dark (maximum: 1). Any mutations not observed in the respective sample have been shaded gray,
        indicating a frequency of 0. Additionally, any non-synonymous mutations are marked with an asterisk
        (*).
      </p>
      <p>
        We only report mutation calls with high levels of certainty in our results (posterior {'>'} 0.9). We
        have made our data processing pipeline available on GitHub at the following link:{' '}
        <ExternalLink url='https://github.com/cbg-ethz/SARS-CoV-2-wastewater-sample-processing-VILOCA' />
      </p>
      <img src='https://cov-spectrum.org/api/v2/resource/wastewater-viloca' alt='Mutation frequency' />
    </div>
  );
};

const DataSources = () => {
  return (
    <div>
      <h2>Data sources</h2>
      <p>
        <ExternalLink url={'https://www.eawag.ch/en/department/sww/projects/sars-cov2-in-wastewater/'}>
          Eawag
        </ExternalLink>{' '}
        collects samples daily at multiple locations around Switzerland. Over the course of the project 
        different locations have been covered. Since January 1st of 2024 the following eight wastewater 
        treatment plants are monitored: Altenrhein (SG), Chur (GR), Genève (GE), Laupen (BE), Lugano (TI), 
        Zürich (ZH), Luzern (LU) and Bern (BE).
      </p>
      <p>
        Until end of December 2023 the project covered six additional wastewater treatment plants:
        Lausanne (VD), Basel (BS), Porrentruy (JU), Neuchâtel (NE), Solothurn (SO) and Schwyz (SZ).
      </p>
      <p>
        Previously, Microsynth AG provided samples from the wastewater treatment plants of Lausanne (Vidy),
        Sierre/Noes (VS) and Porrentruy (JU) (3 times per week until the beginning of July 2023).
      </p>
      <p>
        The Health Department of Basel-Stadt provided samples from the ProRheno AG wastewater treatment plant
        three times per week (once per week until the end of 2022).
      </p>
      <p>
        Until end of May 2022 three times a week the Cantonal Laboratory Zurich (KLZH) provided samples that
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
      <p>
        De-humanized sequencing libraries in FASTQ format for each collection event are publicly available on ENA under{' '}
        <ExternalLink url={'https://www.ebi.ac.uk/ena/browser/view/PRJEB44932'}>
          project ID PRJEB44932
        </ExternalLink>
        .
      </p>
    </div>
  );
};

const VideoPresentation = () => {
  return (
    <div>
      <h2>Video presentation of the surveillance project</h2>
      <p>
        During the webinar{' '}
        <ExternalLink url={'https://iwa-network.org/learn/detecting-covid-19-variants-in-wastewater/'}>
          "Detecting COVID-19 Variants in Wastewater" by the International Water Association (IWA)
        </ExternalLink>
        , Prof. Tamar Kohn and Prof. Niko Beerenwinkel have presented this surveillance project. The
        presentation is the second session of this webinar,
        <ExternalLink url={'https://vimeo.com/560055953#t=1337s'}>
          "Detection and surveillance of SARS-CoV-2 genomic variants in Swiss wastewater" (timecode 22:17).
        </ExternalLink>
        .
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
          'Ivan Topolsky, David Dreifuss, Anika John, Auguste Rimaite, Pelin Burcak Icer, Lara Fuhrmann, Kim Philipp Jablonski, Niko Beerenwinkel'
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
      <Authors authors={'Chaoran Chen, Sarah Nadeau, Tanja Stadler'} />
      <h3>
        <ExternalLink url={'https://www.nexus.ethz.ch/'}>
          NEXUS Personalized Health Technologies, ETH Zürich
        </ExternalLink>{' '}
        /{' '}
        <ExternalLink url={'https://www.sib.swiss/daniel-stekhoven-group'}>
          Swiss Institute of Bioinformatics
        </ExternalLink>
      </h3>
      <Authors authors={'Matteo Carrara, Franziska Singer'} />
      <h3>Eawag</h3>
      <Authors
        authors={
          'Tamar Kohn, Seju Kang, Ayazhan Dauletova, Camille Hablützel, Rachel McLeod, Daniela Yordanova, Jolinda de Korne, Charlie Gan, Lea Caduff, Christoph Ort, Timothy R. Julian'
        }
      />
      <h3>Functional Genomic Center Zürich</h3>
      <Authors authors={'Catharine Aquino, Lennart Opitz, Tim Sykes'} />
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
      <ExternalLink url={'https://bsse.ethz.ch/cbg'}>Computational Biology, D-BSSE, ETHZ.</ExternalLink> Niko
      Beerenwinkel,
    </div>
  );
};
