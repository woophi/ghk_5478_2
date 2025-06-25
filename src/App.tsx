import { ButtonMobile } from '@alfalab/core-components/button/mobile';

import { Typography } from '@alfalab/core-components/typography';

import { AmountInput } from '@alfalab/core-components/amount-input';
import { Divider } from '@alfalab/core-components/divider';
import { Gap } from '@alfalab/core-components/gap';
import { SliderInput } from '@alfalab/core-components/slider-input';
import { Switch } from '@alfalab/core-components/switch';
import { ChangeEvent, useEffect, useState } from 'react';
import icon1 from './assets/icon1.png';
import icon2 from './assets/icon2.png';
import image1 from './assets/image1.png';
import image2 from './assets/image2.png';
import image3 from './assets/image3.png';
import image4 from './assets/image4.png';
import image5 from './assets/image5.png';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxLayout } from './thx/ThxLayout';
import { GaPayload, sendDataToGA } from './utils/events';

function calculateMonthlyPayment(annualRate: number, periodsPerYear: number, totalPeriods: number, loanAmount: number) {
  const monthlyRate = annualRate / periodsPerYear;

  return (monthlyRate * loanAmount) / (1 - Math.pow(1 + monthlyRate, -totalPeriods));
}

const swiperPaymentToGa: Record<string, GaPayload['chosen_option']> = {
  'Без залога': 'nothing',
  Авто: 'auto',
  Недвижимость: 'property',
};

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [thx, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));
  const [amount, setAmount] = useState(16_000);
  const [amount1, setAmount1] = useState(7_500_000);
  const [years1, setYears1] = useState(5);
  const [defaultYears, setDefaultYears] = useState(5);
  const [stringYears1, setStringYears1] = useState('На 5 лет');
  const [paymentType, setPaymentType] = useState('Без залога');

  const [isAutoChecked, setIsAutoChecked] = useState(false);
  const [isRealEstate, setIsRealEstate] = useState(false);
  const [step, setStep] = useState(0);
  const [defaultSum, setDefaultSum] = useState(7_500_000);

  const handleSumSliderChange = ({ value }: { value: number }) => {
    setAmount(value);
  };

  const handleYears1SliderChange = ({ value }: { value: number }) => {
    setYears1(value);

    if (value === 1) {
      setStringYears1('На 1 год');
    } else if (value > 1 && value < 5) {
      setStringYears1(`На ${value} года`);
    } else {
      setStringYears1(`На ${value} лет`);
    }
  };

  const handleSum1SliderChange = ({ value }: { value: number }) => {
    setAmount1(value);
  };

  const handleSumInputChange = (_: ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
    setAmount(Number(value) / 100);
  };

  const handleSum1InputChange = (_: ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
    setAmount1(Number(value) / 100);
  };

  const handleYears1InputChange = (_: ChangeEvent<HTMLInputElement>, { value }: { value: number | string }) => {
    setYears1(Number(value) / 100);
  };

  const formatPipsValue = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

  const formatPipsYearsValue = (value: number) => {
    return `${value.toLocaleString('ru-RU')} ${value <= 1 ? 'год' : 'лет'}`;
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const submit = () => {
    setLoading(true);
    sendDataToGA({
      sum_cred: amount.toFixed(2),
      srok_kredita: years1,
      platezh_mes: '0',
      chosen_option: swiperPaymentToGa[paymentType],
    }).then(() => {
      LS.setItem(LSKeys.ShowThx, true);
      setThx(true);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (step === 1 || thx) {
      document.body.style.backgroundColor = 'white';
    } else {
      document.body.style.backgroundColor = '#F3F4F5';
    }
  }, [step]);

  useEffect(() => {
    if (isAutoChecked) {
      setDefaultSum(7_500_000);
      setAmount1(7_500_000);
    }

    if (isRealEstate) {
      setDefaultSum(30_000_000);
      setAmount1(30_000_000);
    } else {
      setDefaultSum(7_500_000);
      setAmount1(7_500_000);
    }

    if (isAutoChecked && isRealEstate) {
      setDefaultSum(30_000_000);
      setAmount1(30_000_000);
    }
  }, [isRealEstate, isAutoChecked]);

  useEffect(() => {
    if (isRealEstate) {
      setDefaultYears(15);
      setYears1(15);
      setStringYears1('На 15 лет');
    } else {
      setDefaultYears(5);
      setYears1(5);
      setStringYears1('На 5 лет');
    }
  }, [isRealEstate, isAutoChecked]);

  if (thx) {
    return <ThxLayout />;
  }

  return (
    <>
      {step === 0 && (
        <div className={appSt.container} style={{ backgroundColor: 'white', height: '100vh' }}>
          <img src={image1} alt="" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography.TitleResponsive
              font="system"
              tag="h3"
              view="medium"
              className={appSt.productsTitle}
              style={{ textAlign: 'center' }}
            >
              Сколько вы готовы платить в месяц?
            </Typography.TitleResponsive>
            <Typography.Text
              tag="p"
              view="primary-medium"
              color="secondary"
              defaultMargins={false}
              style={{ textAlign: 'center' }}
            >
              Укажите максимальную сумму, которую готовы вносить за кредит
            </Typography.Text>
          </div>

          <Gap size={24} />

          <SliderInput
            block={true}
            value={amount * 100}
            sliderValue={amount}
            onInputChange={handleSumInputChange}
            onSliderChange={handleSumSliderChange}
            onBlur={() => setAmount(prev => clamp(prev, 10_000, 250_000))}
            min={10_000}
            max={250_000}
            range={{ min: 10_000, max: 250_000 }}
            pips={{
              mode: 'values',
              values: [10_000, 250_000],
              format: { to: formatPipsValue },
            }}
            step={1}
            Input={AmountInput}
            labelView="outer"
            size={48}
          />
          <Gap size={96} />
        </div>
      )}

      {step === 1 && (
        <div className={appSt.container} style={{ backgroundColor: 'white', height: '100vh' }}>
          <img src={image2} alt="" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography.TitleResponsive
              font="system"
              tag="h3"
              view="medium"
              className={appSt.productsTitle}
              style={{ textAlign: 'center' }}
            >
              Есть ли у вас собственность?
            </Typography.TitleResponsive>
            <Typography.Text
              tag="p"
              view="primary-medium"
              color="secondary"
              defaultMargins={false}
              style={{ textAlign: 'center' }}
            >
              Важно чтобы это было в вашей собственности
            </Typography.Text>
          </div>

          <Gap size={24} />

          <div className={appSt.sumCard}>
            <Switch
              id="auto"
              block={true}
              reversed={true}
              checked={isAutoChecked}
              label="Автомобиль есть"
              onChange={() => setIsAutoChecked(prevState => !prevState)}
            />
          </div>
          <Divider className={appSt.divider} />
          <div
            className={appSt.sumCard}
            style={{
              borderBottomLeftRadius: '1rem',
              borderBottomRightRadius: '1rem',
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              marginTop: '-1px',
            }}
          >
            <Switch
              id="auto"
              block={true}
              reversed={true}
              checked={isRealEstate}
              label="Недвижимость есть"
              onChange={() => setIsRealEstate(prevState => !prevState)}
            />
          </div>
          <Gap size={96} />
        </div>
      )}

      {step === 2 && (
        <div className={appSt.container} style={{ backgroundColor: 'white', height: '100vh' }}>
          <img src={image3} alt="" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography.TitleResponsive
              font="system"
              tag="h3"
              view="medium"
              className={appSt.productsTitle}
              style={{ textAlign: 'center' }}
            >
              На какую сумму вы хотите взять кредит?
            </Typography.TitleResponsive>
            <Typography.Text
              tag="p"
              view="primary-medium"
              color="secondary"
              defaultMargins={false}
              style={{ textAlign: 'center' }}
            >
              Главное уложиться в доступный диапазон
            </Typography.Text>
          </div>

          <Gap size={24} />

          <SliderInput
            block={true}
            value={amount1 * 100}
            sliderValue={amount1}
            onInputChange={handleSum1InputChange}
            onSliderChange={handleSum1SliderChange}
            onBlur={() => setAmount1(prev => clamp(prev, 10_000, defaultSum))}
            min={10_000}
            max={defaultSum}
            range={{ min: 10_000, max: defaultSum }}
            pips={{
              mode: 'values',
              values: [10_000, defaultSum],
              format: { to: formatPipsValue },
            }}
            step={1}
            Input={AmountInput}
            labelView="outer"
            size={48}
          />
          <Gap size={96} />
        </div>
      )}

      {step === 3 && (
        <div className={appSt.container} style={{ backgroundColor: 'white', height: '100vh' }}>
          <img src={image4} alt="" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography.TitleResponsive
              font="system"
              tag="h3"
              view="medium"
              className={appSt.productsTitle}
              style={{ textAlign: 'center' }}
            >
              На какой срок?
            </Typography.TitleResponsive>
            <Typography.Text
              tag="p"
              view="primary-medium"
              color="secondary"
              defaultMargins={false}
              style={{ textAlign: 'center' }}
            >
              Укажите максимальную сумму, которую готовы вносить за кредит
            </Typography.Text>
          </div>

          <Gap size={24} />

          <SliderInput
            block={true}
            value={stringYears1}
            sliderValue={years1}
            onInputChange={handleYears1InputChange}
            onSliderChange={handleYears1SliderChange}
            onBlur={() => setYears1(prev => clamp(prev, 1, defaultYears))}
            min={1}
            max={defaultYears}
            range={{ min: 1, max: defaultYears }}
            pips={{
              mode: 'values',
              values: [1, defaultYears],
              format: { to: formatPipsYearsValue },
            }}
            step={1}
            labelView="outer"
            size={48}
          />
          <Gap size={96} />
        </div>
      )}

      {step === 4 && (
        <div
          className={appSt.container}
          style={{
            padding: 0,
          }}
        >
          <div
            style={{
              backgroundColor: '#F3F4F5',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Gap size={32} />
            <Typography.Text
              tag="p"
              view="primary-medium"
              color="secondary"
              defaultMargins={false}
              style={{ textAlign: 'center' }}
            >
              Кредит наличными
            </Typography.Text>
            <Typography.TitleResponsive
              font="system"
              tag="h3"
              view="medium"
              className={appSt.productsTitle}
              style={{ textAlign: 'center' }}
            >
              На своих условиях
            </Typography.TitleResponsive>
            <img src={image5} alt="" height={133} style={{ marginTop: '-45px' }} />
            <Gap size={16} />
          </div>

          <div
            className={appSt.sumContainer}
            style={{
              padding: '16px',
              borderRadius: '16px',
              marginTop: '-16px',
            }}
          >
            <div className={appSt.card}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                    {calculateMonthlyPayment(0.339, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽/мес
                  </Typography.Text>
                  <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                    {amount1.toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                  <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                    {years1} {years1 === 1 && 'год'} {years1 > 1 && years1 <= 4 && 'года'} {years1 >= 5 && 'лет'}
                  </Typography.Text>
                  <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                    Без залога
                  </Typography.Text>
                </div>
              </div>
              <ButtonMobile
                block={true}
                size="xs"
                onClick={() => {
                  setPaymentType('Без залога');
                  setStep(5);
                }}
              >
                Выбрать
              </ButtonMobile>
            </div>

            {isAutoChecked && (
              <>
                <Gap size={16} />
                <div className={appSt.card}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                        {calculateMonthlyPayment(0.27, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽/мес
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {amount1.toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {years1} {years1 === 1 && 'год'} {years1 > 1 && years1 <= 4 && 'года'} {years1 >= 5 && 'лет'}
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        Под залог авто
                      </Typography.Text>
                    </div>
                  </div>
                  <ButtonMobile
                    block={true}
                    size="xs"
                    onClick={() => {
                      setPaymentType('Авто');
                      setStep(5);
                    }}
                  >
                    Выбрать
                  </ButtonMobile>
                </div>
              </>
            )}

            {isRealEstate && (
              <>
                <Gap size={16} />
                <div className={appSt.card}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                        {calculateMonthlyPayment(0.2807, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽/мес
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {amount1.toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {years1} {years1 === 1 && 'год'} {years1 > 1 && years1 <= 4 && 'года'} {years1 >= 5 && 'лет'}
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        Под залог недвижимости
                      </Typography.Text>
                    </div>
                  </div>
                  <ButtonMobile
                    block={true}
                    size="xs"
                    onClick={() => {
                      setPaymentType('Недвижимость');
                      setStep(5);
                    }}
                  >
                    Выбрать
                  </ButtonMobile>
                </div>
              </>
            )}
            {(!isRealEstate || !isAutoChecked) && (
              <>
                <Gap size={16} />
                <Typography.TitleResponsive font="system" tag="h3" view="small" className={appSt.productsTitle}>
                  Может подойти
                </Typography.TitleResponsive>
              </>
            )}

            {!isAutoChecked && (
              <>
                <Gap size={16} />
                <div className={appSt.card}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                        {calculateMonthlyPayment(0.27, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽/мес
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {amount1.toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {years1} {years1 === 1 && 'год'} {years1 > 1 && years1 <= 4 && 'года'} {years1 >= 5 && 'лет'}
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        Под залог авто
                      </Typography.Text>
                    </div>
                  </div>
                  <ButtonMobile
                    block={true}
                    size="xs"
                    onClick={() => {
                      setPaymentType('Авто');
                      setStep(5);
                    }}
                  >
                    Выбрать
                  </ButtonMobile>
                </div>
              </>
            )}

            {!isRealEstate && (
              <>
                <Gap size={16} />
                <div className={appSt.card}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                        {calculateMonthlyPayment(0.2807, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽/мес
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {amount1.toLocaleString('ru-RU', {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}{' '}
                        ₽
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        {years1} {years1 === 1 && 'год'} {years1 > 1 && years1 <= 4 && 'года'} {years1 >= 5 && 'лет'}
                      </Typography.Text>
                      <Typography.Text tag="p" view="primary-small" defaultMargins={false}>
                        Под залог недвижимости
                      </Typography.Text>
                    </div>
                  </div>
                  <ButtonMobile
                    block={true}
                    size="xs"
                    onClick={() => {
                      setPaymentType('Недвижимость');
                      setStep(5);
                    }}
                  >
                    Выбрать
                  </ButtonMobile>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {step === 5 && (
        <>
          <div
            className={appSt.container}
            style={{
              paddingLeft: 0,
              paddingRight: 0,
              paddingTop: 0,
              paddingBottom: 0,
            }}
          >
            <div
              style={{
                backgroundColor: '#F3F4F5',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Gap size={32} />
              <Typography.Text
                tag="p"
                view="primary-medium"
                color="secondary"
                defaultMargins={false}
                style={{ textAlign: 'center' }}
              >
                Кредит наличными
              </Typography.Text>
              <Typography.TitleResponsive
                font="system"
                tag="h3"
                view="medium"
                className={appSt.productsTitle}
                style={{ textAlign: 'center' }}
              >
                На своих условиях
              </Typography.TitleResponsive>
              <Gap size={48} />
            </div>

            <div
              className={appSt.sumContainer}
              style={{
                padding: '16px',
                borderRadius: '16px',
                marginTop: '-16px',
                height: 'calc(100vh - 130px)',
              }}
            >
              <div className={appSt.sumCard}>
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  {amount1.toLocaleString('ru-RU', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}{' '}
                  ₽
                </Typography.Text>
                <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                  Сумма кредита
                </Typography.Text>
              </div>
              <Divider className={appSt.divider} />
              <div className={appSt.sumCard} style={{ borderRadius: 0, marginTop: '-1px' }}>
                <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                  На {years1} {years1 === 1 && 'год'} {years1 <= 4 && years1 > 1 && 'года'}
                  {years1 > 4 && 'лет'}
                </Typography.Text>
                <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                  Срок кредита
                </Typography.Text>
              </div>
              <Divider className={appSt.divider} />
              <div className={appSt.sumCard} style={{ borderRadius: 0, marginTop: '-1px' }}>
                {paymentType === 'Без залога' && (
                  <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                    {calculateMonthlyPayment(0.339, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                )}

                {paymentType === 'Авто' && (
                  <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                    {calculateMonthlyPayment(0.27, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                )}

                {paymentType === 'Недвижимость' && (
                  <Typography.Text tag="p" view="primary-large" weight="bold" defaultMargins={false}>
                    {calculateMonthlyPayment(0.2807, 12, years1 * 12, amount1).toLocaleString('ru-RU', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    ₽
                  </Typography.Text>
                )}
                <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                  Платёж в месяц
                </Typography.Text>
              </div>
              <Divider className={appSt.divider} />
              <div
                className={appSt.sumCard}
                style={{
                  borderBottomLeftRadius: '1rem',
                  borderBottomRightRadius: '1rem',
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  marginTop: '-1px',
                }}
              >
                <Typography.Text tag="p" view="primary-large" defaultMargins={false} weight={'bold'}>
                  {paymentType}
                </Typography.Text>
                <Typography.Text tag="p" view="primary-small" color="secondary" defaultMargins={false}>
                  Под залог
                </Typography.Text>
              </div>
            </div>
          </div>

          {step === 5 && (
            <div className={appSt.bottomBtnThx}>
              <ButtonMobile loading={loading} onClick={submit} block view="primary">
                Отправить заявку
              </ButtonMobile>
              <Gap size={8} />
              <ButtonMobile loading={loading} onClick={() => setStep(0)} block view="ghost" style={{ height: '56px' }}>
                Изменить условия
              </ButtonMobile>
            </div>
          )}
        </>
      )}

      {step === 0 && (
        <div className={appSt.bottomBtnThx}>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
            }}
          >
            <div
              style={{
                padding: '27px',
                borderRadius: '16px',
                backgroundColor: '#F8F8F8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img src={icon1} alt="" width={8.5} height={14} />
            </div>
            <div
              onClick={() => setStep(1)}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexBasis: '100%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography.Text tag="p" view="primary-small" defaultMargins={false} style={{ color: 'white' }}>
                  {step + 1} из 4
                </Typography.Text>
                <Typography.Text tag="p" view="primary-medium" defaultMargins={false} style={{ color: 'white' }}>
                  Следующий шаг
                </Typography.Text>
              </div>
              <img src={icon2} alt="" width={8.5} height={14} />
            </div>
            {/*<ButtonMobile*/}
            {/*  loading={loading}*/}
            {/*  onClick={() => setStep(1)}*/}
            {/*  block*/}
            {/*  view="primary"*/}
            {/*>*/}
            {/*  Продолжить*/}
            {/*</ButtonMobile>*/}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className={appSt.bottomBtnThx}>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
            }}
          >
            <div
              onClick={() => setStep(0)}
              style={{
                padding: '27px',
                borderRadius: '16px',
                backgroundColor: '#F8F8F8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img src={icon1} alt="" width={8.5} height={14} />
            </div>
            <div
              onClick={() => setStep(2)}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexBasis: '100%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography.Text tag="p" view="primary-small" defaultMargins={false} style={{ color: 'white' }}>
                  {step + 1} из 4
                </Typography.Text>
                <Typography.Text tag="p" view="primary-medium" defaultMargins={false} style={{ color: 'white' }}>
                  Следующий шаг
                </Typography.Text>
              </div>
              <img src={icon2} alt="" width={8.5} height={14} />
            </div>
            {/*<ButtonMobile*/}
            {/*  loading={loading}*/}
            {/*  onClick={() => setStep(1)}*/}
            {/*  block*/}
            {/*  view="primary"*/}
            {/*>*/}
            {/*  Продолжить*/}
            {/*</ButtonMobile>*/}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className={appSt.bottomBtnThx}>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
            }}
          >
            <div
              onClick={() => setStep(1)}
              style={{
                padding: '27px',
                borderRadius: '16px',
                backgroundColor: '#F8F8F8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img src={icon1} alt="" width={8.5} height={14} />
            </div>
            <div
              onClick={() => setStep(3)}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexBasis: '100%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography.Text tag="p" view="primary-small" defaultMargins={false} style={{ color: 'white' }}>
                  {step + 1} из 4
                </Typography.Text>
                <Typography.Text tag="p" view="primary-medium" defaultMargins={false} style={{ color: 'white' }}>
                  Следующий шаг
                </Typography.Text>
              </div>
              <img src={icon2} alt="" width={8.5} height={14} />
            </div>
            {/*<ButtonMobile*/}
            {/*  loading={loading}*/}
            {/*  onClick={() => setStep(1)}*/}
            {/*  block*/}
            {/*  view="primary"*/}
            {/*>*/}
            {/*  Продолжить*/}
            {/*</ButtonMobile>*/}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={appSt.bottomBtnThx}>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
            }}
          >
            <div
              onClick={() => setStep(2)}
              style={{
                padding: '27px',
                borderRadius: '16px',
                backgroundColor: '#F8F8F8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img src={icon1} alt="" width={8.5} height={14} />
            </div>
            <div
              onClick={() => setStep(4)}
              style={{
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: 'black',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                flexBasis: '100%',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Typography.Text tag="p" view="primary-small" defaultMargins={false} style={{ color: 'white' }}>
                  {step + 1} из 4
                </Typography.Text>
                <Typography.Text tag="p" view="primary-medium" defaultMargins={false} style={{ color: 'white' }}>
                  Следующий шаг
                </Typography.Text>
              </div>
              <img src={icon2} alt="" width={8.5} height={14} />
            </div>
            {/*<ButtonMobile*/}
            {/*  loading={loading}*/}
            {/*  onClick={() => setStep(1)}*/}
            {/*  block*/}
            {/*  view="primary"*/}
            {/*>*/}
            {/*  Продолжить*/}
            {/*</ButtonMobile>*/}
          </div>
        </div>
      )}
    </>
  );
};
