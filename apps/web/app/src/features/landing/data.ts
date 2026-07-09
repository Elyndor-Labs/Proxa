export interface FeaturedMarket {
  id: string;
  league: string;
  title: string;
  sport: string;
  volume: string;
  liquidity: string;
  endsIn: string;
  yesOdds: string;
  noOdds: string;
  hot?: boolean;
}

/** Placeholder markets for landing preview — replaced by on-chain data later. */
export const featuredMarkets: FeaturedMarket[] = [
  {
    id: "1",
    league: "Premier League",
    title: "Man City vs Arsenal — Total Corners Over 9.5",
    sport: "Soccer",
    volume: "$142,800",
    liquidity: "$38,200",
    endsIn: "2h 14m",
    yesOdds: "1.85",
    noOdds: "2.10",
    hot: true,
  },
  {
    id: "2",
    league: "NBA",
    title: "Lakers vs Celtics — LeBron Points Over 26.5",
    sport: "Basketball",
    volume: "$89,400",
    liquidity: "$21,600",
    endsIn: "4h 30m",
    yesOdds: "1.72",
    noOdds: "2.25",
  },
  {
    id: "3",
    league: "NFL",
    title: "Chiefs vs Bills — Combined Sacks Over 4.5",
    sport: "Football",
    volume: "$56,100",
    liquidity: "$15,800",
    endsIn: "1d 6h",
    yesOdds: "2.05",
    noOdds: "1.90",
  },
];
