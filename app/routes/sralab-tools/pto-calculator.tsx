import type { MetaFunction } from '@remix-run/node';
import { Form, useFormState, useSelectState } from 'ariakit';
import {
  addWeeks,
  format,
  getDay,
  setDay,
  startOfYear,
  subDays,
} from 'date-fns';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '~/components/sralab/Button';
import { DatePicker } from '~/components/sralab/DatePicker';
import { Input } from '~/components/sralab/Input';
import { InputError } from '~/components/sralab/InputError';
import { InputRow } from '~/components/sralab/InputRow';
import { InputWrapper } from '~/components/sralab/InputWrapper';
import { Label } from '~/components/sralab/Label';
import { Select } from '~/components/sralab/Select';
import { SelectItem } from '~/components/sralab/SelectItem';
import { SelectLabel } from '~/components/sralab/SelectLabel';
import { SelectPopover } from '~/components/sralab/SelectPopover';
import { Table } from '~/components/sralab/Table';
import { Td } from '~/components/sralab/Td';
import { Th } from '~/components/sralab/Th';
import { Tr } from '~/components/sralab/Tr';

type PayPeriod = {
  start: Date;
  end: Date;
  spend?: number;
  balance: number;
};

type RecalculatePayPeriodData = {
  startDate: number;
  startingPTO: number;
  payPeriodCount: number;
  ptoGainPerPayPeriod: number;
  prevPayPeriodArray: Array<PayPeriod>;
  initialize?: boolean;
};
const recalculatePayPeriod = (d: RecalculatePayPeriodData) => {
  const {
    startDate,
    startingPTO,
    payPeriodCount,
    ptoGainPerPayPeriod,
    prevPayPeriodArray,
    initialize,
  } = d;

  const initialPTO = startingPTO || 0;
  const periodCount = payPeriodCount || 0;
  const ptoGain = ptoGainPerPayPeriod || 0;

  const newPayPeriodArray: Array<PayPeriod> = [];
  for (let i = 0; i < periodCount; i++) {
    // Two week pay periods
    const start = addWeeks(startDate, 2 * i);
    const end = subDays(addWeeks(start, 2), 1);
    // gotta be careful because the number of pay perios could be larger than the previous array
    const spend = prevPayPeriodArray?.[i]?.spend;
    const spendForCalc = spend || 0;
    // Use initialPTO if this is the first pay period
    // Otherwise use the previous pay period's balance
    const balance =
      (i === 0 ? initialPTO : newPayPeriodArray[i - 1].balance + ptoGain) -
      spendForCalc;

    newPayPeriodArray.push({
      start,
      end,
      // This will initialize the spend to 0 on mount
      spend: initialize ? spend || 0 : spend,
      balance,
    });
  }
  return newPayPeriodArray;
};

const firstSundayOfTheYear = setDay(
  startOfYear(new Date()),
  0, // sunday
  { weekStartsOn: getDay(startOfYear(new Date())) },
);

const classifications = {
  Staff: {
    value: 'Staff',
    yearsOfService: [
      { min: 0, max: 3, accrualRate: 7.69 },
      { min: 4, max: Infinity, accrualRate: 9.23 },
    ],
  },
  'Physicians, Department Heads, and Above': {
    value: 'Physicians, Department Heads, and Above',
    yearsOfService: [{ min: 0, max: Infinity, accrualRate: 9.23 }],
  },
};
type Classification = keyof typeof classifications;
const classificationOptions = Object.values(classifications);

const LOCAL_STORAGE_KEY = 'sralab-tools-pto-calculator';

export const meta: MetaFunction = () => ({
  title: 'SRA Lab Tools | PTO Calculator',
  description: 'A tool to help calculate PTO for each pay period.',
});

export default function PTOCalculator() {
  const form = useFormState<{
    initialStartDate: number;
    initialPTO: number;
    payPeriodCount: number;
    classification: Classification;
    yearsOfService: number;
  }>({
    defaultValues: {
      initialStartDate: firstSundayOfTheYear.getTime(),
      initialPTO: 0,
      payPeriodCount: 26,
      classification: 'Staff',
      yearsOfService: 1,
    },
  });
  const { setValues } = form;
  const classificationSelectState = useSelectState<Classification>({
    value: form.values.classification,
    setValue: (value) =>
      form.setValue(form.names.classification, value as Classification),
    gutter: 4,
    sameWidth: true,
  });

  const ptoGainPerPayPeriod = useMemo(
    () =>
      classifications[form.values.classification]?.yearsOfService.find(
        (y) =>
          y.min <= form.values.yearsOfService &&
          form.values.yearsOfService <= y.max,
      )?.accrualRate ?? 0,
    [form.values.classification, form.values.yearsOfService],
  );
  const [payPeriodArray, setPayPeriodArray] = useState<Array<PayPeriod>>(
    recalculatePayPeriod({
      startDate: form.values.initialStartDate,
      startingPTO: form.values.initialPTO,
      payPeriodCount: form.values.payPeriodCount,
      ptoGainPerPayPeriod,
      prevPayPeriodArray: [],
      initialize: true,
    }),
  );

  useEffect(() => {
    setPayPeriodArray((prev) =>
      recalculatePayPeriod({
        startDate: form.values.initialStartDate,
        startingPTO: form.values.initialPTO,
        payPeriodCount: form.values.payPeriodCount,
        ptoGainPerPayPeriod,
        prevPayPeriodArray: prev,
      }),
    );
  }, [
    form.values.initialStartDate,
    form.values.initialPTO,
    form.values.payPeriodCount,
    ptoGainPerPayPeriod,
  ]);

  // Debounce sync with local storage
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ formValues: form.values, payPeriodArray }),
      );
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.values, payPeriodArray]);

  // On first load, load from local storage
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const { formValues, payPeriodArray } = JSON.parse(data);
      setValues(formValues);
      setPayPeriodArray(
        payPeriodArray.map((d: PayPeriod) => ({
          ...d,
          // Have to convert back to date
          start: new Date(d.start),
          end: new Date(d.end),
        })),
      );
    }
  }, [setValues]);

  const tableConfig: Array<{
    header: string;
    cell: (data: PayPeriod, index: number) => ReactNode;
  }> = useMemo(
    () => [
      {
        header: 'Start of Pay Period',
        cell: (d) => format(d.start, 'MM/dd/yyyy'),
      },
      { header: 'End of Pay Period', cell: (d) => format(d.end, 'MM/dd/yyyy') },
      {
        header: 'PTO Spend',
        cell: (d, i) => (
          <Input
            name='ptoSpend'
            type='number'
            onChange={(e) => {
              const spend = e.target.valueAsNumber;
              setPayPeriodArray((prev) => {
                // Its okay to mutate because recalculatePayPeriod immutably modifies the array
                prev[i].spend = isNaN(spend) ? undefined : spend;
                return recalculatePayPeriod({
                  startDate: form.values.initialStartDate,
                  startingPTO: form.values.initialPTO,
                  payPeriodCount: form.values.payPeriodCount,
                  ptoGainPerPayPeriod,
                  prevPayPeriodArray: prev,
                });
              });
            }}
            value={d.spend ?? ''}
            // On blue if it is empty set to 0
            onBlur={(e) => {
              if (e.target.value === '') {
                setPayPeriodArray((prev) => {
                  // Its okay to mutate because recalculatePayPeriod immutably modifies the array
                  prev[i].spend = 0;
                  return recalculatePayPeriod({
                    startDate: form.values.initialStartDate,
                    startingPTO: form.values.initialPTO,
                    payPeriodCount: form.values.payPeriodCount,
                    ptoGainPerPayPeriod,
                    prevPayPeriodArray: prev,
                  });
                });
              }
            }}
          />
        ),
      },
      {
        header: `PTO Balance (+${ptoGainPerPayPeriod})`,
        cell: (d) => {
          const val = Math.round(d.balance * 100) / 100;
          const className = val >= 0 ? '' : 'text-red-500';
          return <span className={className}>{val}</span>;
        },
      },
    ],
    [
      form.values.payPeriodCount,
      ptoGainPerPayPeriod,
      form.values.initialStartDate,
      form.values.initialPTO,
    ],
  );

  return (
    <div className='p-6'>
      <h1 className='mb-1 text-center text-3xl font-bold text-sra-brand-orange-500'>
        PTO Calculator
      </h1>
      <p className='mb-3 text-center leading-6'>
        Sometimes its helpful to have a quick tool to think about PTO.
        <br />
        Spend the time that this saves you to do a nice thing for someone.
      </p>
      <Form state={form} resetOnSubmit={false}>
        <InputRow>
          <InputWrapper>
            <Label name='initialStartDate' htmlFor='initialStartDate'>
              Start of First Pay Period
            </Label>
            <DatePicker
              id='initialStartDate'
              name='initialStartDate'
              selected={new Date(form.values.initialStartDate)}
              onChange={(d) => {
                const val = (d ?? firstSundayOfTheYear).getTime();
                form.setValue(form.names.initialStartDate, val);
                setPayPeriodArray((prev) =>
                  recalculatePayPeriod({
                    startDate: val,
                    startingPTO: form.values.initialPTO,
                    payPeriodCount: form.values.payPeriodCount,
                    ptoGainPerPayPeriod,
                    prevPayPeriodArray: prev,
                  }),
                );
              }}
              isClearable={false}
            />
            <InputError name={form.names.initialStartDate} />
          </InputWrapper>
          <InputWrapper>
            <Label name={form.names.initialPTO}>Initail PTO</Label>
            <Input
              name={form.names.initialPTO}
              type='number'
              min={0}
              onBlur={(e) => {
                if (e.target.value === '') {
                  form.setValue(form.names.initialPTO, 0);
                }
              }}
            />
            <InputError name={form.names.initialPTO} />
          </InputWrapper>
          <InputWrapper>
            <Label name={form.names.payPeriodCount}>
              Number of Pay periods
            </Label>
            <Input
              name={form.names.payPeriodCount}
              type='number'
              min={1}
              max={100}
              onBlur={(e) => {
                if (e.target.value === '') {
                  form.setValue(form.names.payPeriodCount, 26);
                }
              }}
            />
            <InputError name={form.names.payPeriodCount} />
          </InputWrapper>
          <InputWrapper>
            <SelectLabel state={classificationSelectState}>
              Classification
            </SelectLabel>
            <Select state={classificationSelectState} required />
            <SelectPopover state={classificationSelectState}>
              {classificationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectPopover>
            <InputError name={form.names.classification} />
          </InputWrapper>
          {/* <SelectRow
						labelForKey='classification'
						title='Classification'
						value={classifications[classification]}
						options={classificationOptions}
						onChange={(selection) => {
							const newClassification =
								(selection?.value as Classification | undefined) ?? 'staff'
							setClassification(newClassification)
							const ptoGainPerPayPeriod =
								classifications[newClassification]?.yearsOfService.find(
									(y) => y.min <= yearsOfService && yearsOfService <= y.max,
								)?.accrualRate ?? 0
							setPayPeriodArray((prev) =>
								recalculatePayPeriod({
									startDate: initialStartDate,
									startingPTO: initialPTO,
									payPeriodCount,
									ptoGainPerPayPeriod,
									prevPayPeriodArray: prev,
								}),
							)
						}}
						getOptionValue={(option) => option.value}
						getOptionLabel={(option) => option.name}
						rowSize='condensed'
						className='flex-1'
					/> */}
          <InputWrapper>
            <Label name={form.names.yearsOfService}>Years of Service</Label>
            <Input
              name={form.names.yearsOfService}
              type='number'
              min={0}
              step={1}
              onBlur={(e) => {
                if (e.target.value === '') {
                  form.setValue(form.names.yearsOfService, 1);
                }
              }}
            />
            <InputError name={form.names.yearsOfService} />
          </InputWrapper>
          <InputWrapper className='w-auto flex-none self-end'>
            <Button
              type='button'
              className='inline h-[45px] w-auto'
              variant='secondary'
              onClick={() => {
                form.reset();
                setPayPeriodArray(
                  recalculatePayPeriod({
                    startDate: form.values.initialStartDate,
                    startingPTO: form.values.initialPTO,
                    payPeriodCount: form.values.payPeriodCount,
                    ptoGainPerPayPeriod,
                    prevPayPeriodArray: [],
                    initialize: true,
                  }),
                );
              }}
            >
              Clear
            </Button>
          </InputWrapper>
        </InputRow>
      </Form>
      <Table>
        <thead>
          <Tr variant='head'>
            {tableConfig.map((config) => (
              <Th key={config.header}>{config.header}</Th>
            ))}
          </Tr>
        </thead>
        <tbody>
          {payPeriodArray.map((d, i) => (
            <Tr key={i}>
              {tableConfig.map((config) => (
                <Td key={config.header}>{config.cell(d, i)}</Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
