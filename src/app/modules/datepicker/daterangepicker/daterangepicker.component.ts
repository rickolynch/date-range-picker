import { Component, OnInit, ElementRef, EventEmitter, Input, HostListener } from '@angular/core';
var moment = require('moment');
//import * as moment from 'moment';
//import { PickerService } from '../picker.service';
@Component({
  selector: 'app-daterangepicker',
  templateUrl: './daterangepicker.component.html',
  styleUrls: ['./daterangepicker.component.scss']
})
export class DaterangepickerComponent implements OnInit {
  locale = {
    direction: 'ltr',
    format: moment.localeData().longDateFormat('L'),
    separator: ' - ',
    applyLabel: 'Apply',
    cancelLabel: 'Cancel',
    weekLabel: 'W',
    customRangeLabel: 'Custom Range',
    daysOfWeek: moment.weekdaysMin(),
    monthNames: moment.monthsShort(),
    firstDay: moment.localeData().firstDayOfWeek()
  };
  _mindate: any = null;
  @Input()
  set minDate(date) {
    if (date) {
      this._mindate = moment(date, this.locale.format);
    }
  }
  get minDate() {
    return this._mindate;
  }
  _maxdate: any = null;
  @Input()
  set maxDate(date) {
    if (date) {
      this._maxdate = moment(date, this.locale.format);
    }
  }
  get maxDate() {
    return this._maxdate;
  }

  _singleDatePicker: boolean = false;
  @Input()
  set singleDatePicker(isSingle) {
    if (isSingle) {
      this._singleDatePicker = isSingle;
    }
  }
  get singleDatePicker() {
    return this._singleDatePicker;
  }
  linkedCalendars = true;

  _startDate: any;
  @Input()
  set startDate(date) {
    if (date) {
      this._startDate = moment(date, this.locale.format).startOf('day');
    }
  }
  get startDate() {
    return this._startDate;
  }

  _endDate: any;
  @Input()
  set endDate(date) {
    if (date) {
      this._endDate = moment(date, this.locale.format).endOf('day');
    }
  }
  get endDate() {
    return this._endDate;
  }


  tmpDate: any = null;
  tmpEndDate: any = null;
  leftCalendar;
  rightCalendar;
  ranges: any;
  days: any = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  displayStartDate: string;
  displayEndDate: string;
  focusedInput: string = 'start';
  close = new EventEmitter();
  dateSelected = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.ranges = [{
      title: 'Today',
      period: [moment(), moment()]
    }, {
      title: 'Yesterday',
      period: [moment().subtract(1, 'day'), moment().subtract(1, 'day')]
    }, {
      title: 'Last 7 Days',
      period: [moment().subtract(6, 'day'), moment()]
    }, {
      title: 'Last 30 Days',
      period: [moment().subtract(29, 'day'), moment()]
    }, {
      title: 'This Month',
      period: [moment().startOf('month'), moment()]
    }, {
      title: 'Last Month',
      period: [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
    }];
    if (!this.startDate) {
      this._startDate = moment().startOf('day');
    }
    this.leftCalendar = { month: this.startDate.clone().date(2), calendar: null };

    if (!this.endDate) {
      this._endDate = this.startDate.clone().endOf('day');
    }
    this.rightCalendar = { month: this.endDate.clone().date(2).add(1, 'month'), calendar: null };

    this.displayStartDate = this.startDate.format(this.locale.format);
    this.displayEndDate = this.endDate.format(this.locale.format);
    this.renderCalendar('left');
    this.renderCalendar('right');
  }

  renderCalendar(side: string) {
    let date = (side == 'left' ? this.leftCalendar.month : this.rightCalendar.month);
    let month = date.month();
    let year = date.year();
    let hour = date.hour();
    let minute = date.minute();
    let second = date.second();
    let daysInMonth = moment([year, month]).daysInMonth();
    let firstDay = moment([year, month, 1]);
    let lastDay = moment([year, month, daysInMonth]);
    let lastMonth = moment(firstDay).subtract(1, 'month').month();
    let lastYear = moment(firstDay).subtract(1, 'month').year();
    let daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
    let dayOfWeek = firstDay.day();
    let calendar = [];
    for (let i = 0; i < 6; i++) {
      calendar[i] = [];
    }

    let startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
    if (startDay > daysInLastMonth) {
      startDay -= 7;
    }


    if (dayOfWeek === this.locale.firstDay) {
      startDay = daysInLastMonth - 6;
    }
    let curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);
    let col, row;
    for (let i = 0, col = 0, row = 0; i < 42; i++ , col++ , curDate = moment(curDate).add(24, 'hour')) {
      if (i > 0 && col % 7 === 0) {
        col = 0;
        row++;
      }
      calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
      curDate.hour(12);

      if (this.minDate && calendar[row][col].format('YYYY-MM-DD') == this.minDate.format('YYYY-MM-DD') && calendar[row][col].isBefore(this.minDate) && side == 'left') {
        calendar[row][col] = this.minDate.clone();
      }

      if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') == this.maxDate.format('YYYY-MM-DD') && calendar[row][col].isAfter(this.maxDate) && side == 'right') {
        calendar[row][col] = this.maxDate.clone();
      }

    }

    //make the calendar object available to hoverDate/clickDate
    if (side == 'left') {
      this.leftCalendar.calendar = calendar;
    } else {
      this.rightCalendar.calendar = calendar;
    }
  }
  isToday(day) {
    if (!day) {
      return false;
    }
    return moment().format('L') === day.format('L');
  }
  isActiveDate(day) {
    if (day.format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
      return true;
    } else if (this.endDate && day.format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
      return true;
    }
    return false;
  }
  isStartDate(day) {
    if (day.format('YYYY-MM-DD') == this.startDate.format('YYYY-MM-DD')) {
      return true;
    }
    return false;
  }
  isEndDate(day) {
    if (this.endDate && day.format('YYYY-MM-DD') == this.endDate.format('YYYY-MM-DD')) {
      return true;
    }
    return false;
  }
  isDisabled(day) {
    if (this.minDate && day.isBefore(this.minDate, 'day')) {
      return true;
    } else if (this.maxDate && day.isAfter(this.maxDate, 'day')) {
      return true;
    }
    return false;
  }
  isInRange(day) {
    if (this.endDate) {
      if (day.isAfter(this.startDate) && day.isBefore(this.endDate)) {
        return true;
      } else {
        return false;
      }
    } else {
      if (day.isAfter(this.startDate) && day.isBefore(this.tmpDate)) {
        return true;
      } else {
        return false;
      }
    }
  }
  nextAvailable() {
    let calendar = (this.singleDatePicker ? this.leftCalendar : this.rightCalendar);
    if (!this.maxDate || this.maxDate.isAfter(calendar.month.endOf('month'))) {
      return true;
    } else {
      return false;
    }
  }
  prevAvailable() {
    let calendar = this.leftCalendar;
    if (!this.minDate || this.minDate.isBefore(calendar.month.startOf('month'))) {
      return true;
    } else {
      return false;
    }
  }
  notActiveMonth(day, side) {
    let cal = (side == 'left' ? this.leftCalendar.calendar : this.rightCalendar.calendar);
    if (day.month() != cal[1][1].month()) {
      return true;
    }
    return false;
  }
  getMonth(side) {
    let cal = (side == 'left' ? this.leftCalendar.calendar : this.rightCalendar.calendar);
    return this.locale.monthNames[cal[1][1].month()] + cal[1][1].format(" YYYY");
  }
  clickPrev() {
    this.leftCalendar.month.subtract(1, 'month');
    this.renderCalendar('left');
    if (this.rightCalendar.calendar) {
      this.rightCalendar.month.subtract(1, 'month');
      this.renderCalendar('right');
    }
  }
  clickNext() {
    this.leftCalendar.month.add(1, 'month');
    this.renderCalendar('left');
    if (this.rightCalendar.calendar) {
      this.rightCalendar.month.add(1, 'month');
      this.renderCalendar('right');
    }
  }
  clickdate(day, side) {
    if (this.isDisabled(day)) {
      return false;
    }
    if (this.endDate || day.isBefore(this.startDate, 'day')) {
      this._endDate = null;
      this.setStartDate(day.clone());
      if (this.tmpEndDate) {
        this.setEndDate(this.tmpEndDate.clone());
      } else {
        this.focusedInput = 'end';
      }
    } else if (!this.endDate && day.isBefore(this.startDate)) {
      this.setEndDate(this.startDate.clone());
      this.focusedInput = 'start';
    } else {
      this.setEndDate(day.clone());
      this.focusedInput = 'start';
    }
    if (this.singleDatePicker) {
      this.setEndDate(this.startDate);
      this.focusedInput = 'start';
      this.dateSelected.emit(this.startDate.format(this.locale.format));
    }
    this.updateView();
  }
  rangeClick(range) {
    this.setStartDate(range.period[0].clone());
    this.setEndDate(range.period[1].clone());
    this.updateView();
    this.applyClick();
  }
  rangeHover(range) {
    this.displayStartDate = range.period[0].format(this.locale.format);
    this.displayEndDate = range.period[1].format(this.locale.format);
  }
  hoverExit() {
    this.displayStartDate = this.startDate.format(this.locale.format);
    this.displayEndDate = (this.endDate ? this.endDate.format(this.locale.format) : this.displayStartDate);
  }
  hoverdate(day) {
    if (this.isDisabled(day)) {
      return false;
    }
    this.tmpDate = day.clone();
    if (this.focusedInput === 'start') {
      this.displayStartDate = this.tmpDate.format(this.locale.format);
    } else {
      this.displayEndDate = this.tmpDate.format(this.locale.format);
    }
  }
  inputFocus(side) {
    this.focusedInput = side;
    if (this.endDate) {
      this.tmpEndDate = this.endDate.clone();
      if (side == 'start') {
      } else if (side == 'end') {
        this._endDate = null;
      }
    }

  }
  inputBlur(side) {
  }
  inputChanged(event, side) {
    let val = moment(event.target.value, this.locale.format);
    if (this.isDisabled(val)) {
      return false;
    }
    if (side === 'start') {
      this.setStartDate(val.clone());
    } else if (side === 'end') {
      this.setEndDate(val.clone());
      if (val.isBefore(this.startDate, 'day')) {
        this.setStartDate(val.clone());
      }
    }
    this.updateView();
  }
  updateView() {
    if (this.endDate) {

      //if both dates are visible already, do nothing
      if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
        (this.startDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.startDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
        &&
        (this.endDate.format('YYYY-MM') == this.leftCalendar.month.format('YYYY-MM') || this.endDate.format('YYYY-MM') == this.rightCalendar.month.format('YYYY-MM'))
      ) {
        return;
      }

      this.leftCalendar.month = this.startDate.clone().date(2);
      if (!this.linkedCalendars && (this.endDate.month() != this.startDate.month() || this.endDate.year() != this.startDate.year())) {
        this.rightCalendar.month = this.endDate.clone().date(2);
      } else {
        this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
      }

    } else {
      if (this.leftCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM') && this.rightCalendar.month.format('YYYY-MM') != this.startDate.format('YYYY-MM')) {
        this.leftCalendar.month = this.startDate.clone().date(2);
        this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
      }
    }
    if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
      this.rightCalendar.month = this.maxDate.clone().date(2);
      this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
    }
    this.renderCalendar('left');
    this.renderCalendar('right');
  }
  setStartDate(startDate) {
    if (typeof startDate === 'string')
      this._startDate = moment(startDate, this.locale.format);

    if (typeof startDate === 'object')
      this._startDate = moment(startDate);

    this.displayStartDate = this.startDate.format(this.locale.format);
  }
  setEndDate(endDate) {
    if (typeof endDate === 'string')
      this._endDate = moment(endDate, this.locale.format);

    if (typeof endDate === 'object')
      this._endDate = moment(endDate);


    this.displayEndDate = this.endDate.format(this.locale.format);
    this.tmpEndDate = null;
  }
  applyClick() {
    this.dateSelected.emit(this.startDate.format(this.locale.format) + ' - ' + this.endDate.format(this.locale.format));
  }
  cancelClick() {
    this.close.emit(false);
  }
}
