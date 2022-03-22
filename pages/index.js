import React, { useMemo } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { withTheme } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import Chain from '../components/chain';
import Header from '../components/header';

import AddIcon from '@material-ui/icons/Add';
import classes from './index.module.css';
import { chainIds } from '../components/chains';
import { fetcher } from '../utils/utils';
import { useSearch, useTestnets } from '../stores';
import allExtraRpcs from '../utils/extraRpcs.json';

function removeEndingSlash(rpc) {
  return rpc.endsWith('/') ? rpc.substr(0, rpc.length - 1) : rpc;
}

export async function getStaticProps({ params }) {
  const chains = await fetcher('https://chainid.network/chains.json');
  const chainTvls = await fetcher('https://api.llama.fi/chains');

  function populateChain(chain) {
    const extraRpcs = allExtraRpcs[chain.name]?.rpcs;
    if (extraRpcs !== undefined) {
      const rpcs = new Set(chain.rpc.map(removeEndingSlash).filter((rpc) => !rpc.includes('${INFURA_API_KEY}')));
      extraRpcs.forEach((rpc) => rpcs.add(removeEndingSlash(rpc)));
      chain.rpc = Array.from(rpcs);
    }
    const chainSlug = chainIds[chain.chainId];
    if (chainSlug !== undefined) {
      const defiChain = chainTvls.find((c) => c.name.toLowerCase() === chainSlug);
      return defiChain === undefined
        ? chain
        : {
            ...chain,
            tvl: defiChain.tvl,
            chainSlug,
          };
    }
    return chain;
  }

  const sortedChains = chains
    .filter((c) => c.name !== '420coin') // same chainId as ronin
    .map(populateChain)
    .sort((a, b) => {
      return (b.tvl ?? 0) - (a.tvl ?? 0);
    });

  return {
    props: {
      sortedChains,
    },
    revalidate: 3600,
  };
}

function Home({ changeTheme, theme, sortedChains }) {
  const testnets = useTestnets((state) => state.testnets);
  const search = useSearch((state) => state.search);

  const addNetwork = () => {
    window.open('https://github.com/ethereum-lists/chains', '_blank');
  };

  const addRpc = () => {
    window.open('https://github.com/DefiLlama/chainlist/blob/main/utils/extraRpcs.json', '_blank');
  };

  const chains = useMemo(() => {
    if (!testnets) {
      return sortedChains.filter((item) => {
        const testnet =
          item.name?.toLowerCase().includes('test') ||
          item.title?.toLowerCase().includes('test') ||
          item.network?.toLowerCase().includes('test');
        return !testnet;
      });
    } else return sortedChains;
  }, [testnets, sortedChains]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Chainz-链之家-助您快速畅游web3</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <div className={theme.palette.type === 'dark' ? classes.containerDark : classes.container}>
          <div className={classes.copyContainer}>
            <div className={classes.copyCentered}>
              <Typography variant="h1" className={classes.chainListSpacing}>
                <span className={classes.helpingUnderline}>Chainz-链之家</span>
              </Typography>
              <Typography variant="h2" className={classes.helpingParagraph}>
                自助添加所有链--自由翱翔web3
              </Typography>
              <Typography className={classes.subTitle}>
                链接钱包--搜索链名称--点击add即可添加进钱包。
              </Typography>
              <Button
                size="large"
                color="primary"
                variant="contained"
                className={classes.addNetworkButton}
                onClick={addNetwork}
                endIcon={<AddIcon />}
              >
                <Typography className={classes.buttonLabel}>Add Your Network</Typography>
              </Button>
              
              <div className={classes.socials}>
                <a
                  className={`${classes.socialButton}`}
                  href="https://github.com/DefiLlama/chainlist"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg version="1.1" width="24" height="24" viewBox="0 0 24 24">
                    <path
                      fill={'#2F80ED'}
                      d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                    />
                  </svg>
                  <Typography variant="body1" className={classes.sourceCode}>
                    Powerd by chainlist
                  </Typography>
                </a>

                <a
                  className={`${classes.socialButton}`}
                  href="https://twitter.com/laoyan06"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg width="24" height="24" viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill={'#2F80ED'}
                      d="M731.554909 410.205091c0-5.166545-0.093091-10.286545-0.325818-15.36 22.109091-16.477091 41.285818-37.096727 56.459636-60.695273-20.293818 9.122909-42.077091 15.220364-64.977455 17.780364 23.365818-14.382545 41.285818-37.376 49.757091-64.977455-21.876364 13.265455-46.08 22.760727-71.819636 27.694545-20.619636-23.458909-50.036364-38.4-82.571636-38.958545-62.464-1.024-113.105455 51.758545-113.105455 117.899636 0 9.402182 0.977455 18.525091 2.932364 27.322182C413.835636 414.859636 330.472727 365.893818 274.711273 292.072727c-9.728 17.687273-15.313455 38.353455-15.313455 60.509091 0 41.890909 19.968 79.127273 50.315636 101.096727C291.141818 452.840727 273.733818 447.208727 258.466909 437.992727c0 0.512 0 1.024 0 1.536 0 58.554182 39.005091 107.613091 90.763636 119.063273-9.495273 2.699636-19.502545 4.096-29.789091 4.049455-7.307636-0.046545-14.382545-0.837818-21.271273-2.327273 14.382545 47.988364 56.180364 83.037091 105.658182 84.200727-38.725818 32.116364-87.505455 51.293091-140.474182 51.153455-9.122909 0-18.152727-0.605091-26.996364-1.722182 50.082909 34.350545 109.521455 54.365091 173.428364 54.365091C617.797818 748.357818 731.554909 567.296 731.554909 410.205091z"
                    ></path>
                  </svg>
                  <Typography variant="body1" className={classes.sourceCode}>
                    Twitter
                  </Typography>
                </a>
              </div>
            </div>
          </div>
          <div className={theme.palette.type === 'dark' ? classes.listContainerDark : classes.listContainer}>
            <Header changeTheme={changeTheme} />
            <div className={classes.cardsContainer}>
              {(search === ''
                ? chains
                : chains.filter((chain) => {
                    //filter
                    return (
                      chain.chain.toLowerCase().includes(search.toLowerCase()) ||
                      chain.chainId.toString().toLowerCase().includes(search.toLowerCase()) ||
                      chain.name.toLowerCase().includes(search.toLowerCase()) ||
                      (chain.nativeCurrency ? chain.nativeCurrency.symbol : '')
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    );
                  })
              ).map((chain, idx) => {
                return <Chain chain={chain} key={idx} />;
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withTheme(Home);
