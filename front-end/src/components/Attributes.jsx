import React from "react";
import { Surface, Radar, RadarChart, PolarGrid, Legend, Tooltip,
    PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
    LabelList, Label } from 'recharts';
import styled from 'styled-components';
import theme from '../style/theme';
const { colors } = theme;

const TooltipContainer = styled.div`
    background-color:rgba(0,0,0,0.7);
    color: ${colors.white};
`;

const ChartContainer = styled.div`
    width: 500px;
    height: 350px;
    margin: 0 auto;
    tspan {
        fill: ${colors.white};
    }
`;

const getIntroOfPage = (label) => {
    if (label === 'acousticness') {
        return "How acoustic the songs are";
    } if (label === 'danceability') {
        return "How suitable the songs are for dancing";
    } if (label === 'energy') {
        return "How intense/active the songs are";
    } if (label === 'instrumentalness') {
        return 'How much of each song is vocal content';
    } if (label === 'liveness') {
        return 'How likely the songs were performed live';
    } if (label === 'speechiness') {
        return 'How much of each song is spoken words';
    } if (label === 'valence') {
        return 'How musically positive the songs are';
    }
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active) {
      return (
        <TooltipContainer>
          <p className="label">{`${label}: ${payload[0].value}`}</p>
          {/* <p className="intro">{getIntroOfPage(label)}</p> */}
          {/* <p className="desc">Anything you want can be displayed here.</p> */}
        </TooltipContainer>
      );
    }
  
    return null;
  };

class Attributes extends React.Component {
    constructor() {
        super();
    }
    render() {
        const attributes = this.props.data
        return (
            <ChartContainer>
                <ResponsiveContainer>
                    <RadarChart 
                        data={attributes} 
                        margin={{top: 5, right: 30, left: 30, bottom: 5,
                    }}>
                        <PolarGrid radialLines={true} />
                        <PolarAngleAxis dataKey="attribute" />
                        <Radar dataKey="1" stroke={colors.blue} fill={colors.blue} fillOpacity={0.6} />
                        <Tooltip content={<CustomTooltip />}/>
                    </RadarChart>
                </ResponsiveContainer>
            </ChartContainer>
        );
    }
}

export default Attributes;