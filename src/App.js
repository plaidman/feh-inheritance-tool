// MIT License

// Copyright (c) 2017 Elson Chin

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React, { Component } from 'react';
import './App.css';
import { Dropdown, TextBox, escapeRegExp, storageAvailable, isMobile } from './utility.js';
import { BuildManager,
         moveIcon, weaponIcon, rarityIcon, skillTypeIcon, unitPortrait,
         parseSkills, getUnitsWithSkill, getPossibleSkills,
         calcStats, calcCost, calcTotalCost } from './helper.js';

const units = require('./data/units.json');
const weapons = require('./data/weapons.json');
const assists = require('./data/assists.json');
const specials = require('./data/specials.json');
const passives = require('./data/passives.json');

class SkillInfoRow extends Component {
  constructor(props) {
    super(props);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
    this.handlePassiveSkillSelect = this.handlePassiveSkillSelect.bind(this);
    this.handleSkillLevelSelect = this.handleSkillLevelSelect.bind(this);
  }

  handleSkillSelect(skillName) {
    this.props.onSkillSelect(skillName, this.props.skillType);
  }

  handlePassiveSkillSelect(skillName) {
    this.props.onSkillSelect(this.getPassiveLevels(skillName, true) ? this.getPassiveLevels(skillName, true) : skillName, this.props.skillType);
  }

  handleSkillLevelSelect(skillLevel) {
    this.props.onSkillSelect(/[^1-9]*/.exec(this.props.skillName)[0] + skillLevel, this.props.skillType);
  }

  getPassiveLevels(skillName, getFullMaxPassive = false) {
    let type = RegExp(escapeRegExp(skillName)).test(Object.keys(passives.A).toString()) ? 'A' :
               RegExp(escapeRegExp(skillName)).test(Object.keys(passives.B).toString()) ? 'B' : 
                                                                                          'C';
    let result = new Set();
    for (let key in passives[type]) {
      if (RegExp(escapeRegExp(skillName)).test(key)) {
        if (/[1-9]/.test(key))
          result.add(/[1-9]/.exec(key)[0]);
        else
          return null;
      }
    }
    
    if (getFullMaxPassive)
      return skillName + [...result][result.size-1];
    
    return [...result];
  }

  // parseSkillEffect(skill, stats) {
  //   if (skill === 'Chilling Wind') {
  //     let value = specials[skill].value;
  //     value = Math.floor(stats[/(.*):/.exec(value)[1]] * parseFloat(/:(.*)/.exec(value)[1]));
  //     //return this.props.effect.replace(/{.*}/, value)
  //     let result = /(.*)({.*})(.*)/.exec(this.props.effect).splice(1);
  //     result[1] = <b className="skill-effect-value" key={skill}>{value}</b>;
  //     return result;
  //   }
  //   return this.props.effect;
  // }

  formatInheritList() {
    let inheritList = this.props.inheritList;
    let result = [];

    if (inheritList[1]) {
      result.push('1', <img className="rarity-icon" src={rarityIcon[1]} title={1 + '★'} alt={1 + '★'} key={1} />, ': ');
      
      if (this.props.usePortraits) {
        for (let unitName of inheritList[1]) {
          result.push(<img className="unit-portrait-small" src={unitPortrait[unitName]} title={unitName} alt={unitName} key={unitName} />)
        }
        result.push(' ');
      }
      else {
        result.push(inheritList[1].join(', '));
        result.push('. ');
      }
    }
    if (inheritList[2]) {
      result.push('2', <img className="rarity-icon" src={rarityIcon[2]} title={2 + '★'} alt={2 + '★'} key={2} />, ': ');
      
      if (this.props.usePortraits) {
        for (let unitName of inheritList[2]) {
          result.push(<img className="unit-portrait-small" src={unitPortrait[unitName]} title={unitName} alt={unitName} key={unitName} />)
        }
        result.push(' ');
      }
      else {
        result.push(inheritList[2].join(', '));
        result.push('. ');
      }
    }
    if (inheritList[3]) {
      result.push('3', <img className="rarity-icon" src={rarityIcon[3]} title={3 + '★'} alt={3 + '★'} key={3} />, ': ');
      
      if (this.props.usePortraits) {
        for (let unitName of inheritList[3]) {
          result.push(<img className="unit-portrait-small" src={unitPortrait[unitName]} title={unitName} alt={unitName} key={unitName} />)
        }
        result.push(' ');
      }
      else {
        result.push(inheritList[3].join(', '));
        result.push('. ');
      }
    }
    if (inheritList[4]) {
      result.push('4', <img className="rarity-icon" src={rarityIcon[4]} title={4 + '★'} alt={4 + '★'} key={4} />, ': ');
      
      if (this.props.usePortraits) {
        for (let unitName of inheritList[4]) {
          result.push(<img className="unit-portrait-small" src={unitPortrait[unitName]} title={unitName} alt={unitName} key={unitName} />)
        }
        result.push(' ');
      }
      else {
        result.push(inheritList[4].join(', '));
        result.push('. ');
      }
    }
    if (inheritList[5]) {
      result.push('5', <img className="rarity-icon" src={rarityIcon[5]} title={5 + '★'} alt={5 + '★'} key={5} />, ': ');
      
      if (this.props.usePortraits) {
        for (let unitName of inheritList[5]) {
          result.push(<img className="unit-portrait-small" src={unitPortrait[unitName]} title={unitName} alt={unitName} key={unitName} />)
        }
        result.push(' ');
      }
      else {
        result.push(inheritList[5].join(', '));
        result.push('.');
      }
    }

    return result;
  }

  render() {
    let inheritList = this.formatInheritList();

    let skillDropdown, skillLevel;
    let hasSkillLevel = false;
    if (/[1-9]/.test(this.props.skillName)) {
      hasSkillLevel = true;
      skillDropdown = 
        <td className="skill-name-sub">
          <Dropdown addClass='skillNameSub'
                    options={this.props.options}
                    value={/[^1-9]*/.exec(this.props.skillName)[0]}
                    onChange={this.handlePassiveSkillSelect} />
        </td>;
      skillLevel =
        <td className="skill-level">
          <Dropdown addClass='skillLevel'
                    options={this.getPassiveLevels(/[^1-9]*/.exec(this.props.skillName)[0])}
                    value={/[1-9]/.exec(this.props.skillName)[0]}
                    onChange={this.handleSkillLevelSelect} />
        </td>;
    } else {
      skillDropdown = 
        <td className="skill-name" colSpan="2">
          <Dropdown addClass='skillName'
                    options={this.props.options}
                    value={this.props.skillName}
                    onChange={/passive/.test(this.props.skillType) ? this.handlePassiveSkillSelect : this.handleSkillSelect} />
        </td>;
    }
    
    return (
      <tr>
        <td className="skill-type">
          {
            this.props.category === "Weapon"  ? <img src={skillTypeIcon.Weapon} title="Weapon" alt="Weapon" /> :
            this.props.category === "Assist"  ? <img src={skillTypeIcon.Assist} title="Assist" alt="Assist" /> :
            this.props.category === "Special" ? <img src={skillTypeIcon.Special} title="Special" alt="Special" /> :
                                                this.props.category
          }
        </td>
        {skillDropdown}
        {hasSkillLevel && skillLevel}
        {!!this.props.showDesc &&
        <td className="skill-info-container">
          <div className="skill-effect">{this.props.effect}</div>
        </td>
        }
        <td className="skill-info-container">
          <div className="skill-inherit">{inheritList}</div>
        </td>
        <td className="skill-info-container">
          <div className="skill-cost">{this.props.cost || ''}</div>
        </td>
      </tr>
    );
  }
}

class SkillInfoTable extends Component {
  constructor(props) {
    super(props);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
  }

  handleSkillSelect(skillName, skillType) {
    this.props.onSkillSelect(skillName, skillType);
  }

  getInheritList(unitName, skill, type) {
    if (!skill) return '';
    
    let unitList = getUnitsWithSkill(skill, type);
    let exclude = [];

    for (let rarity in unitList) {
      for (let unit of unitList[rarity]) {
        if (/Alfonse|Anna|Sharena/.test(unit))
          exclude.push(unit);
        // if (RegExp(escapeRegExp(unitName) + '$').test(unit))
        //   return '';
      }
      
      for (let unit of exclude) {
        if (unitList[rarity].includes(unit)) {
          unitList[rarity].splice(unitList[rarity].indexOf(unit), 1);
          if (!unitList[rarity].length)
            delete unitList[rarity];
        }
      }
    }
    
    return unitList;
  }

  render() {
    let skills = {};
    skills.weapon = this.props.skills.weapon;
    skills.assist = this.props.skills.assist;
    skills.special = this.props.skills.special;
    skills.passiveA = this.props.skills.passiveA;
    skills.passiveB = this.props.skills.passiveB;
    skills.passiveC = this.props.skills.passiveC;

    let skillOptions = getPossibleSkills(this.props.unitName);
    
    return (
      <table>
        <thead>
          <tr className="skill-header">
            <th className="reset-button-cell"></th>
            <th colSpan="2" className="dropdown-header text-left">Skill</th>
            {!!this.props.showDesc && <th className="text-left">Effect</th>}
            <th className="text-left">Inherited From</th>
            <th>SP</th>
          </tr>
        </thead>
        <tbody>
          <SkillInfoRow category='Weapon' 
                        skillName={skills.weapon}
                        skillType='weapon'
                        options={skillOptions.weapons}
                        effect={weapons[skills.weapon] ? 'Might: ' + weapons[skills.weapon].might + '. ' + weapons[skills.weapon].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.weapon,'weapon')}
                        cost={calcCost(this.props.unitName, this.props.skills.weapon)}
                        usePortraits={this.props.usePortraits}
                        showDesc={this.props.showDesc}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='Assist' 
                        skillName={skills.assist}
                        skillType='assist'
                        options={skillOptions.assists}
                        effect={assists[skills.assist] ? assists[skills.assist].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.assist,'assist')}
                        cost={calcCost(this.props.unitName, this.props.skills.assist)}
                        usePortraits={this.props.usePortraits}
                        showDesc={this.props.showDesc}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='Special' 
                        skillName={skills.special}
                        skillType='special'
                        options={skillOptions.specials}
                        effect={specials[skills.special] ? 'Charge: ' + specials[skills.special].count + '. ' + specials[skills.special].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.special,'special')}
                        cost={calcCost(this.props.unitName, this.props.skills.special)}
                        usePortraits={this.props.usePortraits}
                        showDesc={this.props.showDesc}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='A' 
                        skillName={skills.passiveA} 
                        skillType='passiveA'
                        options={skillOptions.passivesA}
                        effect={passives.A[skills.passiveA] ? passives.A[skills.passiveA].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveA,'passiveA')}
                        cost={calcCost(this.props.unitName, this.props.skills.passiveA)}
                        usePortraits={this.props.usePortraits}
                        showDesc={this.props.showDesc}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='B' 
                        skillName={skills.passiveB} 
                        skillType='passiveB'
                        options={skillOptions.passivesB}
                        effect={passives.B[skills.passiveB] ? passives.B[skills.passiveB].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveB,'passiveB')}
                        cost={calcCost(this.props.unitName, this.props.skills.passiveB)}
                        usePortraits={this.props.usePortraits}
                        showDesc={this.props.showDesc}
                        onSkillSelect={this.handleSkillSelect} />
          <SkillInfoRow category='C' 
                        skillName={skills.passiveC} 
                        skillType='passiveC'
                        options={skillOptions.passivesC}
                        effect={passives.C[skills.passiveC] ? passives.C[skills.passiveC].effect : ''} 
                        inheritList={this.getInheritList(this.props.unitName,skills.passiveC,'passiveC')}
                        cost={calcCost(this.props.unitName, this.props.skills.passiveC)}
                        usePortraits={this.props.usePortraits}
                        showDesc={this.props.showDesc}
                        onSkillSelect={this.handleSkillSelect} />
        </tbody>
      </table>
    )
  }
}

class UnitInfo extends Component {
  constructor(props) {
    super(props);
    this.handleUnitSelect = this.handleUnitSelect.bind(this);
    this.handleBoonSelect = this.handleBoonSelect.bind(this);
    this.handleBaneSelect = this.handleBaneSelect.bind(this);
    this.handleMergeSelect = this.handleMergeSelect.bind(this);
  }

  handleUnitSelect(unitName) {
    this.props.onUnitSelect(unitName);
  }

  handleBoonSelect(boon) {
    this.props.onBoonBaneSelect("boon", boon ? boon.slice(1) : '');
  }

  handleMergeSelect(mergeBonus) {
    this.props.onMergeSelect(mergeBonus ? mergeBonus.slice(1) : '');
  }

  handleBaneSelect(bane) {
    this.props.onBoonBaneSelect("bane", bane ? bane.slice(1) : '');
  }

  render() {
    let name = this.props.unitName;
    let color = units[name].color;
    let wpnType = units[name].wpnType;
    let movType = units[name].movType;
    let fullWpnType = color + ' ' + wpnType;
    let bOptions = ["", "HP", "Atk", "Spd", "Def", "Res"];

    return (
      <div>
        <table id="unitInfoLeft">
          <tbody>
            <tr>
              <td rowSpan="2"><img className="unit-portrait" src={unitPortrait[this.props.unitName]} title={this.props.unitName} alt={this.props.unitName} /></td>
              <th className="unit-name text-left dropdown-header">Name</th>
              <th className="unit-type" colSpan="2">Type</th>
              <th className="unit-merge">Merge</th>
            </tr>
            <tr>
              <td>
                <Dropdown addClass='unitName'
                          options={Object.keys(units)}
                          value={this.props.unitName}
                          onChange={this.handleUnitSelect} />
              </td>
              <td className="unit-type-sub"><img src={weaponIcon[color][wpnType]} title={fullWpnType} alt={fullWpnType} /></td>
              <td className="unit-type-sub"><img src={moveIcon[movType]} title={movType} alt={movType} /></td>
              <td>
                <Dropdown addClass='unitMerge'
                          options={[...Array(11).keys()].map(x => { return x ? '+' + x : ''; })}
                          value={'+' + this.props.merge}
                          onChange={this.handleMergeSelect} />
              </td>
            </tr>
          </tbody>
        </table>
        <table id="unitInfoRight">
          <tbody>
            <tr>
              <th className="unit-bb">Boon</th>
              <th className="unit-bb">Bane</th>
              <th className="unit-stat">HP</th>
              <th className="unit-stat">Atk</th>
              <th className="unit-stat">Spd</th>
              <th className="unit-stat">Def</th>
              <th className="unit-stat">Res</th>
              <th className="unit-BST">Total</th>
            </tr>
            <tr>
              <td>
                <Dropdown id="boon" addClass="unitBB"
                          options={bOptions.map(option => { return option ? '+' + option : ""; })}
                          value={'+' + this.props.boonBane.boon}
                          onChange={this.handleBoonSelect} />
              </td>
              <td>
                <Dropdown id="bane" addClass="unitBB"
                          options={bOptions.map(option => { return option ? '-' + option : ""; })}
                          value={'-' + this.props.boonBane.bane}
                          onChange={this.handleBaneSelect} />
              </td>
              <td className={this.props.boonBane.boon === "HP" ? "boon" : this.props.boonBane.bane === "HP" ? "bane" : ""}>{this.props.stats.HP}</td>
              <td className={this.props.boonBane.boon === "Atk" ? "boon" : this.props.boonBane.bane === "Atk" ? "bane" : ""}>{this.props.stats.Atk}</td>
              <td className={this.props.boonBane.boon === "Spd" ? "boon" : this.props.boonBane.bane === "Spd" ? "bane" : ""}>{this.props.stats.Spd}</td>
              <td className={this.props.boonBane.boon === "Def" ? "boon" : this.props.boonBane.bane === "Def" ? "bane" : ""}>{this.props.stats.Def}</td>
              <td className={this.props.boonBane.boon === "Res" ? "boon" : this.props.boonBane.bane === "Res" ? "bane" : ""}>{this.props.stats.Res}</td>
              <td>
                {Object.keys(this.props.stats).reduce((a,b) => {
                  if (Number.isInteger(a))
                    return a + this.props.stats[b];
                  return this.props.stats[a] + this.props.stats[b];
                })}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }
}

class ToggleBox extends Component {
  constructor(props) {
    super(props);

    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleRawStatsToggle = this.handleRawStatsToggle.bind(this);
    this.handlePortraitToggle = this.handlePortraitToggle.bind(this);
    this.handleSkillEffectToggle = this.handleSkillEffectToggle.bind(this);
  }
  
  handleResetClick() {
    this.props.onResetClick();
  }

  handleRawStatsToggle(e) {
    this.props.onRawStatsToggle(e.target.checked);
  }

  handlePortraitToggle(e) {
    this.props.onPortraitToggle(e.target.checked);
  }

  handleSkillEffectToggle(e) {
    this.props.onSkillEffectToggle(e.target.checked);
  }

  render() {
    return (
      <div>
        <div className="toggle" title="Reset skills to default">
          <label>
            <input type="button" onClick={this.handleResetClick} />
            <div className="toggle-label noselect">Reset</div>
          </label>
        </div>
        <div className="toggle" title="Display raw stats">
          <label>
            <input type="checkbox" onChange={this.handleRawStatsToggle} />
            <div className="toggle-label noselect">Raw Stats</div>
          </label>
        </div>
        <div className="toggle" title="Use unit portraits in the inheritance list">
          <label>
            <input type="checkbox" checked={!!this.props.usePortraits} onChange={this.handlePortraitToggle} />
            <div className="toggle-label noselect">Portraits</div>
          </label>
        </div>
        <div className="toggle" title="Display the Skill Effect column">
          <label>
            <input type="checkbox" checked={!!this.props.showDesc} onChange={this.handleSkillEffectToggle} />
            <div className="toggle-label noselect">Effects</div>
          </label>
        </div>
      </div>
    )
  }
}

class InheritanceTool extends Component {
  constructor(props) {
    super(props);
    
    this.initState('Abel');

    this.handleUnitSelect = this.handleUnitSelect.bind(this);
    this.handleBoonBaneSelect = this.handleBoonBaneSelect.bind(this);
    this.handleMergeSelect = this.handleMergeSelect.bind(this);
    this.handleSkillSelect = this.handleSkillSelect.bind(this);
    this.handleResetClick = this.handleResetClick.bind(this);
    this.handleRawStatsToggle = this.handleRawStatsToggle.bind(this);
    this.handlePortraitToggle = this.handlePortraitToggle.bind(this);
    this.handleSkillEffectToggle = this.handleSkillEffectToggle.bind(this);
    this.handleBuildLoad = this.handleBuildLoad.bind(this);
  }

  initState(initUnit) {
    let initSkills = {
        weapon: units[initUnit].skills.weapon[units[initUnit].skills.weapon.length-1].name,
        assist: units[initUnit].skills.assist[units[initUnit].skills.assist.length-1].name,
        special: units[initUnit].skills.special[units[initUnit].skills.special.length-1].name,
        passiveA: units[initUnit].skills.passiveA[units[initUnit].skills.passiveA.length-1].name,
        passiveB: units[initUnit].skills.passiveB[units[initUnit].skills.passiveB.length-1].name,
        passiveC: units[initUnit].skills.passiveC[units[initUnit].skills.passiveC.length-1].name
      };
    let initBoonBane = {"boon":"","bane":""};
    let initStats = calcStats(initUnit, initSkills, initBoonBane);

    this.state = {
      unitName: initUnit,
      boonBane: initBoonBane,
      merge: 0,
      stats: initStats,
      skills: initSkills,
      rawStatsOn: false,
      usePortraits: storageAvailable('localStorage') && localStorage.usePortraits && JSON.parse(localStorage.usePortraits),
      showDesc: (storageAvailable('localStorage') && localStorage.showDesc) ? JSON.parse(localStorage.showDesc) : true,
      totalCost: calcTotalCost(initUnit, initSkills)
    }
  }

  handleUnitSelect(unitName) {
    let newSkills = parseSkills(JSON.parse(JSON.stringify(units[unitName].skills)));

    this.setState({
      unitName: unitName,
      boonBane: {"boon":"","bane":""},
      merge: 0,
      stats: this.state.rawStatsOn ? calcStats(unitName, null) : calcStats(unitName, newSkills),
      skills: newSkills,
      totalCost: calcTotalCost(unitName, newSkills)
    });
  }

  handleBoonBaneSelect(boonOrBane, value) {
    let newBoonBane = this.state.boonBane;
    newBoonBane[boonOrBane] = value.slice(0,1) + (value.length > 2 ? value.slice(1).toLowerCase() : value.slice(1));

    let other = boonOrBane === 'boon' ? 'bane' : 'boon';
    if (newBoonBane[other] === newBoonBane[boonOrBane])
      newBoonBane[other] = '';

    this.setState({
      boonBane: newBoonBane,
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, this.state.boonBane, this.state.merge)
                                   : calcStats(this.state.unitName, this.state.skills, this.state.boonBane, this.state.merge),
    });
  }

  handleMergeSelect(mergeBonus) {
    this.setState({
      merge: mergeBonus,
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, this.state.boonBane, mergeBonus)
                                   : calcStats(this.state.unitName, this.state.skills, this.state.boonBane, mergeBonus),
    });
  }

  handleSkillSelect(skillName, skillType) {
    let newSkills = JSON.parse(JSON.stringify(this.state.skills));
    switch(skillType) {
      case 'weapon':
        newSkills.weapon = skillName;
        break;
      case 'assist':
        newSkills.assist = skillName;
        break;
      case 'special':
        newSkills.special = skillName;
        break;
      case 'passiveA':
        newSkills.passiveA = skillName;
        break;
      case 'passiveB':
        newSkills.passiveB = skillName;
        break;
      case 'passiveC':
        newSkills.passiveC = skillName;
        break;
      default:
        break;
    }

    this.setState({ 
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, this.state.boonBane, this.state.merge) 
                                   : calcStats(this.state.unitName, newSkills, this.state.boonBane, this.state.merge),
      skills: newSkills,
      totalCost: calcTotalCost(this.state.unitName, newSkills)
    });
  }

  handleResetClick() {
    let skills = parseSkills(JSON.parse(JSON.stringify(units[this.state.unitName].skills)));
    this.setState({
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, this.state.boonBane, this.state.merge)
                                   : calcStats(this.state.unitName, skills, this.state.boonBane, this.state.merge),
      skills: skills,
      totalCost: calcTotalCost(this.state.unitName, skills)
    })
  }

  handleRawStatsToggle(isOn) {
    if (isOn) {
      this.setState({
        rawStatsOn: true,
        stats: calcStats(this.state.unitName, null, this.state.boonBane, this.state.merge)
      });
    } else {
      this.setState({
        rawStatsOn: false,
        stats: calcStats(this.state.unitName, this.state.skills, this.state.boonBane, this.state.merge)
      });
    }
  }

  handlePortraitToggle(isOn) {
    if (storageAvailable('localStorage')) {
      localStorage.usePortraits = JSON.stringify(isOn);
    }
    this.setState({
      usePortraits: isOn
    });
  }

  handleSkillEffectToggle(isOn) {
    if (storageAvailable('localStorage')) {
      localStorage.showDesc = JSON.stringify(isOn);
    }
    this.setState({
      showDesc: isOn
    });
  }

  handleBuildLoad(build) {
    let newBoonBane = {
      "boon": build.Boon,
      "bane": build.Bane
    };
    let newSkills = {
      "weapon": build.Weapon,
      "assist": build.Assist,
      "special": build.Special,
      "passiveA": build.PassiveA,
      "passiveB": build.PassiveB,
      "passiveC": build.PassiveC,
    }

    this.setState({
      boonBane: newBoonBane,
      skills: newSkills,
      stats: this.state.rawStatsOn ? calcStats(this.state.unitName, null, newBoonBane, this.state.merge)
                                   : calcStats(this.state.unitName, newSkills, newBoonBane, this.state.merge),
      totalCost: calcTotalCost(this.state.unitName, newSkills)
    });
  }

  render() {
    return (
      <div className="tool">
        <div className="toggle-box">
          <ToggleBox usePortraits={this.state.usePortraits}
                     showDesc={this.state.showDesc}
                     onResetClick={this.handleResetClick}
                     onRawStatsToggle={this.handleRawStatsToggle}
                     onPortraitToggle={this.handlePortraitToggle}
                     onSkillEffectToggle={this.handleSkillEffectToggle} />
        </div>
        <div className="char-info">
          <UnitInfo unitName={this.state.unitName}
                    boonBane={this.state.boonBane}
                    merge={this.state.merge}
                    stats={this.state.stats}
                    rawStatsOn={this.state.rawStatsOn}
                    onUnitSelect={this.handleUnitSelect}
                    onBoonBaneSelect={this.handleBoonBaneSelect}
                    onMergeSelect={this.handleMergeSelect} />
        </div>
        <div className="skill-info">
          <SkillInfoTable unitName={this.state.unitName}
                          stats={this.state.stats}
                          skills={this.state.skills}
                          usePortraits={this.state.usePortraits}
                          showDesc={this.state.showDesc}
                          onSkillSelect={this.handleSkillSelect} />
        </div>
        <div className="bottom-row">
          <BuildManager unitName={this.state.unitName}
                        onLoadClick={this.handleBuildLoad} />
          <TextBox id="totalSP" title="Total SP" text={this.state.totalCost} />
        </div>
      </div>
    );
  }
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <span>
            <span className="header">Fire Emblem: Heroes</span>
            <br />
            <span className="sub-header">Skill Inheritance Tool</span>
          </span>
        </div>
        <InheritanceTool />
        <div id="footer">
          <div id="footer-content">
            <p id="contact">
              Bug reports, feedback, or suggestions? Submit 
              an <a href="https://github.com/arghblargh/feh-inheritance-tool">issue</a> on Github or 
              message <a href="https://www.reddit.com/u/omgwtfhax_">/u/omgwtfhax_</a> on Reddit. 
              <a id="tip" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=XLGEXXDZ8EY5A" target="_blank">
                <img src="https://arghblargh.github.io/feh-inheritance-tool/orb.png" alt="Send a tip" title="Send a tip" />
              </a>
            </p>
            <p id="disclaimer">
              <i>Fire Emblem: Heroes</i> and all respective content are the 
              sole property of Nintendo and Intelligent Systems.
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
