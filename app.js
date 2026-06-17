/* ==========================================
   Antecipa - Core Logic & Calculators
   High-Fidelity Real-time Calculations & SVG Rendering
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Element Selectors
    const elements = {
        chargeValue: document.getElementById('chargeValue'),
        applyCashDiscount: document.getElementById('applyCashDiscount'),
        cashDiscountPct: document.getElementById('cashDiscountPct'),
        cashDiscountInputWrapper: document.getElementById('cashDiscountInputWrapper'),
        
        // Down Payment (Entrada) Selectors
        hasDownPayment: document.getElementById('hasDownPayment'),
        downPaymentPanel: document.getElementById('downPaymentPanel'),
        downPaymentValue: document.getElementById('downPaymentValue'),
        downPaymentMethod: document.getElementById('downPaymentMethod'),
        downPaymentRate: document.getElementById('downPaymentRate'),
        downPaymentError: document.getElementById('downPaymentError'),

        btnAbsorb: document.getElementById('btnAbsorb'),
        btnPass: document.getElementById('btnPass'),
        cardRate1: document.getElementById('cardRate1'),
        cardRate2_6: document.getElementById('cardRate2_6'),
        cardRate7_12: document.getElementById('cardRate7_12'),
        cardRate13_21: document.getElementById('cardRate13_21'),
        fixedFee: document.getElementById('fixedFee'),
        btnAntManual: document.getElementById('btnAntManual'),
        btnAntAuto: document.getElementById('btnAntAuto'),
        antRateVista: document.getElementById('antRateVista'),
        antRateParc: document.getElementById('antRateParc'),
        prepaymentModel: document.getElementById('prepaymentModel'),
        selectedInstallment: document.getElementById('selectedInstallment'),
        
        // Selective Prepayment Elements
        selectiveList: document.getElementById('selectiveList'),
        btnSelectAll: document.getElementById('btnSelectAll'),
        btnDeselectAll: document.getElementById('btnDeselectAll'),
        selValAnt: document.getElementById('selValAnt'),
        selValFluxo: document.getElementById('selValFluxo'),
        selValCost: document.getElementById('selValCost'),
        selValNet: document.getElementById('selValNet'),
        
        // Dashboard Stats
        labelTotalPaid: document.getElementById('labelTotalPaid'),
        valTotalPaid: document.getElementById('valTotalPaid'),
        subTotalPaid: document.getElementById('subTotalPaid'),
        valTotalFees: document.getElementById('valTotalFees'),
        subTotalFees: document.getElementById('subTotalFees'),
        valNetReceived: document.getElementById('valNetReceived'),
        valEffectiveCost: document.getElementById('valEffectiveCost'),
        
        // Helpers
        helperTitle: document.getElementById('helperTitle'),
        helperText: document.getElementById('helperText'),
        
        // Output Containers
        chartContainer: document.getElementById('drawerChartContainer'),
        comparisonTableBody: document.getElementById('comparisonTableBody'),
        tableSubtitle: document.querySelector('.table-subtitle'),
        
        // Drawer / Modal Elements
        drawerOverlay: document.getElementById('drawerOverlay'),
        btnDrawerClose: document.getElementById('btnDrawerClose'),
        drawerTitle: document.getElementById('drawerTitle'),
        calculationFlow: document.getElementById('calculationFlow'),
        calcGrossValue: document.getElementById('calcGrossValue'),
        calcCardFee: document.getElementById('calcCardFee'),
        calcNetBeforeAnt: document.getElementById('calcNetBeforeAnt'),
        calcAntFee: document.getElementById('calcAntFee'),
        calcNetReceived: document.getElementById('calcNetReceived'),
        drawerTableBody: document.getElementById('drawerTableBody'),
        drawerTableDiscountHeader: document.getElementById('drawerTableDiscountHeader'),
        
        // Theme Toggle
        themeToggle: document.getElementById('themeToggle'),
        
        // Presets & Optimizer
        presetHybrid10x: document.getElementById('presetHybrid10x'),
        presetVistaAnt: document.getElementById('presetVistaAnt'),
        presetVista2x: document.getElementById('presetVista2x'),
        presetParc12x: document.getElementById('presetParc12x'),
        optimizerInsightsContainer: document.getElementById('optimizerInsightsContainer'),
        
        // Scenario Comparer
        btnSaveToComparer: document.getElementById('btnSaveToComparer'),
        comparerCard: document.getElementById('comparerCard'),
        comparerGrid: document.getElementById('comparerGrid'),
        btnClearComparison: document.getElementById('btnClearComparison')
    };

    // Global State
    let state = {
        baseValue: 16900.00,
        applyCashDiscount: false,
        cashDiscountPct: 7.00,
        hasDownPayment: true,
        downPaymentValue: 6900.00,
        downPaymentMethod: 'pix',
        downPaymentRate: 0.00,
        absorptionModel: 'absorb', // 'absorb' or 'pass'
        cardRate1: 2.77,
        cardRate2_6: 3.35,
        cardRate7_12: 3.69,
        cardRate13_21: 4.29,
        fixedFee: 0.29,
        prepaymentType: 'manual', // 'manual' or 'auto'
        antRateVista: 1.25,
        antRateParc: 1.70,
        prepaymentModel: 'simple', // 'simple' or 'compound'
        selectedInstallment: 10,
        selectedPrepayments: [],
        comparedScenarios: []
    };

    // Format utility helpers
    const formatBRL = (val) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(val);
    };

    const formatPercent = (val) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val / 100);
    };

    // Custom Currency Input Mask for BRL (handles keystroke styling)
    const initCurrencyMask = () => {
        elements.chargeValue.addEventListener('input', (e) => {
            // Strip out non-digits
            let cleanVal = e.target.value.replace(/\D/g, '');
            
            // Limit length
            if (cleanVal.length > 11) {
                cleanVal = cleanVal.substring(0, 11);
            }
            
            // Convert to float value (cents divided by 100)
            const numericVal = parseFloat(cleanVal) / 100 || 0;
            state.baseValue = numericVal;
            
            // Format back to string formatted standard (16.900,00)
            e.target.value = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericVal);
            
            calculateAndRender();
        });

        // Focus events to make it select all on focus
        elements.chargeValue.addEventListener('focus', (e) => {
            setTimeout(() => {
                const len = e.target.value.length;
                e.target.setSelectionRange(0, len);
            }, 50);
        });
    };

    // Theme Toggle Handler
    const initThemeToggle = () => {
        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            
            // Redraw chart to update axis colors and fonts correctly
            const allResults = calculateAllInstallments();
            renderChart(allResults[state.selectedInstallment - 1]);
        });
    };

    // Segmented Control (Who Pays) Handler
    const initSegmentedControl = () => {
        elements.btnAbsorb.addEventListener('click', () => {
            elements.btnAbsorb.classList.add('active');
            elements.btnPass.classList.remove('active');
            state.absorptionModel = 'absorb';
            
            elements.helperTitle.textContent = "Como funciona o cálculo?";
            elements.helperText.innerHTML = "No modo <strong>Vendedor Absorve</strong>, o comprador paga o valor nominal de sua venda. As taxas do cartão e de antecipação são deduzidas, reduzindo o seu repasse líquido.";
            
            calculateAndRender();
        });

        elements.btnPass.addEventListener('click', () => {
            elements.btnPass.classList.add('active');
            elements.btnAbsorb.classList.remove('active');
            state.absorptionModel = 'pass';
            
            elements.helperTitle.textContent = "Como funciona o repasse?";
            elements.helperText.innerHTML = "No modo <strong>Repasse ao Cliente</strong>, recalculamos o valor cobrado do comprador para que, após descontadas todas as taxas, você receba <strong>exatamente</strong> o valor desejado.";
            
            calculateAndRender();
        });
    };

    // Segmented Control (Prepayment Type) Handler
    const initPrepaymentToggle = () => {
        elements.btnAntManual.addEventListener('click', () => {
            elements.btnAntManual.classList.add('active');
            elements.btnAntAuto.classList.remove('active');
            state.prepaymentType = 'manual';
            
            state.antRateVista = 1.25;
            state.antRateParc = 1.70;
            
            elements.antRateVista.value = "1.25";
            elements.antRateParc.value = "1.70";
            
            calculateAndRender();
        });

        elements.btnAntAuto.addEventListener('click', () => {
            elements.btnAntAuto.classList.add('active');
            elements.btnAntManual.classList.remove('active');
            state.prepaymentType = 'auto';
            
            state.antRateVista = 1.15;
            state.antRateParc = 1.60;
            
            elements.antRateVista.value = "1.15";
            elements.antRateParc.value = "1.60";
            
            calculateAndRender();
        });
    };

    // Generic Event Listeners for editable inputs
    const initInputs = () => {
        elements.cardRate1.addEventListener('input', (e) => {
            state.cardRate1 = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });

        elements.cardRate2_6.addEventListener('input', (e) => {
            state.cardRate2_6 = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });

        elements.cardRate7_12.addEventListener('input', (e) => {
            state.cardRate7_12 = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });

        elements.cardRate13_21.addEventListener('input', (e) => {
            state.cardRate13_21 = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });

        elements.fixedFee.addEventListener('input', (e) => {
            state.fixedFee = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });

        elements.antRateVista.addEventListener('input', (e) => {
            state.antRateVista = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });

        elements.antRateParc.addEventListener('input', (e) => {
            state.antRateParc = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });

        elements.prepaymentModel.addEventListener('change', (e) => {
            state.prepaymentModel = e.target.value;
            calculateAndRender();
        });

        elements.selectedInstallment.addEventListener('change', (e) => {
            state.selectedInstallment = parseInt(e.target.value);
            state.selectedPrepayments = Array.from({length: state.selectedInstallment}, (_, idx) => idx + 1);
            calculateAndRender();
        });

        // Cash Discount Event Listeners
        elements.applyCashDiscount.addEventListener('change', (e) => {
            state.applyCashDiscount = e.target.checked;
            if (state.applyCashDiscount) {
                elements.cashDiscountInputWrapper.style.opacity = '1';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'auto';
            } else {
                elements.cashDiscountInputWrapper.style.opacity = '0.3';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'none';
            }
            calculateAndRender();
        });

        elements.cashDiscountPct.addEventListener('input', (e) => {
            state.cashDiscountPct = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });
    };

    // Down Payment (Entrada) Handlers
    const initDownPayment = () => {
        // Toggle entry panel visibility and update state
        elements.hasDownPayment.addEventListener('change', (e) => {
            state.hasDownPayment = e.target.checked;
            if (state.hasDownPayment) {
                elements.downPaymentPanel.classList.add('expanded');
            } else {
                elements.downPaymentPanel.classList.remove('expanded');
                state.downPaymentValue = 0;
                elements.downPaymentValue.value = "0,00";
            }
            calculateAndRender();
        });

        // BRL Input Mask for Down Payment value
        elements.downPaymentValue.addEventListener('input', (e) => {
            let cleanVal = e.target.value.replace(/\D/g, '');
            if (cleanVal.length > 11) {
                cleanVal = cleanVal.substring(0, 11);
            }
            const numericVal = parseFloat(cleanVal) / 100 || 0;
            state.downPaymentValue = numericVal;

            e.target.value = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(numericVal);

            calculateAndRender();
        });

        elements.downPaymentValue.addEventListener('focus', (e) => {
            setTimeout(() => {
                const len = e.target.value.length;
                e.target.setSelectionRange(0, len);
            }, 50);
        });

        // Down Payment Method Change (auto-updates down payment rate)
        elements.downPaymentMethod.addEventListener('change', (e) => {
            state.downPaymentMethod = e.target.value;
            let defaultRate = 0.00;
            
            if (state.downPaymentMethod === 'debit') {
                defaultRate = 1.99;
            } else if (state.downPaymentMethod === 'credit1x') {
                defaultRate = state.cardRate1;
            } else if (state.downPaymentMethod === 'pix') {
                defaultRate = 0.00;
            }
            
            state.downPaymentRate = defaultRate;
            elements.downPaymentRate.value = defaultRate.toFixed(2);
            calculateAndRender();
        });

        // Down Payment Rate Manual Input
        elements.downPaymentRate.addEventListener('input', (e) => {
            state.downPaymentRate = Math.max(0, parseFloat(e.target.value) || 0);
            calculateAndRender();
        });
    };

    // Drawers close handlers
    const initDrawer = () => {
        elements.btnDrawerClose.addEventListener('click', () => {
            elements.drawerOverlay.classList.remove('active');
        });
        
        elements.drawerOverlay.addEventListener('click', (e) => {
            if (e.target === elements.drawerOverlay) {
                elements.drawerOverlay.classList.remove('active');
            }
        });
    };

    // Core Calculator Logic
    const calculateInstallmentDetails = (n, baseValue, cardRate, fixedFee, prepaymentRate, prepaymentModel, absorptionModel, selectedPrepayments = null, hasDownPaymentOverride = null, downPaymentValOverride = null, downPaymentRateOverride = null) => {
        const T_card = cardRate / 100;
        const T_ant = prepaymentRate / 100;
        
        // Down Payment (Entrada) variables from global state or override
        const hasDownPayment = hasDownPaymentOverride !== null ? hasDownPaymentOverride : state.hasDownPayment;
        const downPaymentVal = hasDownPayment ? (downPaymentValOverride !== null ? downPaymentValOverride : state.downPaymentValue) : 0.00;
        const downPaymentRate = hasDownPayment ? (downPaymentRateOverride !== null ? downPaymentRateOverride : state.downPaymentRate) : 0.00;
        const T_down = downPaymentRate / 100;

        // Apply cash discount if enabled and appropriate (universally applies to total sales price)
        let activeBaseValue = baseValue;
        if (state.applyCashDiscount) {
            activeBaseValue = baseValue * (1 - (state.cashDiscountPct / 100));
        }

        // Down payment remains raw and nominal, serving as a direct deduction of the discounted total
        let activeDownPaymentVal = downPaymentVal;

        const V_down_net = activeDownPaymentVal * (1 - T_down);
        const Fee_down = activeDownPaymentVal * T_down;

        let V_buyer = 0;
        let Fee_card = 0;
        let L_net = 0;
        let Fee_ant = 0;
        let V_received = 0;
        let F_ant = 0;
        let V_buyer_installments = 0;
        let V_received_installments = 0;
        let downPaymentErrorActive = false;
        const installments = [];

        // If no list of selected prepayments is specified, default to all being prepaid
        if (!selectedPrepayments) {
            selectedPrepayments = Array.from({length: n}, (_, idx) => idx + 1);
        }

        // 1. Calculate selective prepayment factor and list of individual factors
        let sumF = 0;
        const installmentFactors = [];
        for (let i = 1; i <= n; i++) {
            let Fi = 1.0;
            if (selectedPrepayments.includes(i)) {
                // Asaas calendar rule: each installment is paid every 32 days.
                // Prepaying to D+1 utile implies we are prepaying a total of (32 * i - 1) days.
                const daysToPrepay = 32 * i - 1;
                if (prepaymentModel === 'simple') {
                    Fi = Math.max(0, 1 - (T_ant / 30) * daysToPrepay);
                } else {
                    Fi = 1 / Math.pow(1 + T_ant, daysToPrepay / 30);
                }
            }
            sumF += Fi;
            installmentFactors.push(Fi);
        }
        F_ant = sumF / n;

        // 2. Compute flow based on absorption scenario
        if (absorptionModel === 'absorb') {
            // Check if down payment is larger than total charge
            if (hasDownPayment && activeDownPaymentVal >= activeBaseValue) {
                downPaymentErrorActive = true;
                V_buyer_installments = 0;
            } else {
                V_buyer_installments = hasDownPayment ? (activeBaseValue - activeDownPaymentVal) : activeBaseValue;
            }

            V_buyer = activeDownPaymentVal + V_buyer_installments;
            
            if (V_buyer_installments > 0) {
                const baseInst = Math.floor((V_buyer_installments / n) * 100) / 100;
                const remainder = Math.round((V_buyer_installments - baseInst * n) * 100);
                
                let calcFeeCard = 0;
                let calcLNet = 0;
                
                for (let i = 1; i <= n; i++) {
                    const gross_i = baseInst + (i <= remainder ? 0.01 : 0);
                    const pctFee_i = Math.floor(gross_i * T_card * 100) / 100;
                    const fixedFee_i = Math.floor((fixedFee / n) * 100) / 100;
                    const fee_i = pctFee_i + fixedFee_i;
                    const net_i = gross_i - fee_i;
                    
                    installments.push({
                        gross: gross_i,
                        feeCard: fee_i,
                        netBeforeAnt: net_i
                    });
                    
                    calcFeeCard += fee_i;
                    calcLNet += net_i;
                }
                
                Fee_card = Math.round(calcFeeCard * 100) / 100;
                L_net = Math.round(calcLNet * 100) / 100;
            } else {
                Fee_card = 0;
                L_net = 0;
            }
            
            // Calculate individual prepayment fees based on selections
            let sumFeeAnt = 0;
            for (let i = 1; i <= n; i++) {
                if (selectedPrepayments.includes(i)) {
                    const Fi = installmentFactors[i - 1];
                    const instNet = installments[i - 1] ? installments[i - 1].netBeforeAnt : 0;
                    sumFeeAnt += instNet * (1 - Fi);
                }
            }
            Fee_ant = Math.round(Math.max(0, sumFeeAnt) * 100) / 100;
            V_received_installments = Math.round(Math.max(0, L_net - Fee_ant) * 100) / 100;
            V_received = V_down_net + V_received_installments;
        } else {
            // Pass fees to buyer (Cálculo Reverso Unificado)
            let V_received_installments_target = activeBaseValue;
            
            if (hasDownPayment) {
                if (V_down_net >= activeBaseValue) {
                    downPaymentErrorActive = true;
                    V_received_installments_target = 0;
                } else {
                    V_received_installments_target = activeBaseValue - V_down_net;
                }
            }
            
            // Avoid division by zero if F_ant is 0
            const activeF = F_ant > 0 ? F_ant : 1.0;
            V_buyer_installments = V_received_installments_target > 0 ? ((V_received_installments_target / activeF + fixedFee) / (1 - T_card)) : 0;
            
            if (V_buyer_installments > 0) {
                const baseInst = Math.floor((V_buyer_installments / n) * 100) / 100;
                const remainder = Math.round((V_buyer_installments - baseInst * n) * 100);
                
                let calcFeeCard = 0;
                let calcLNet = 0;
                
                for (let i = 1; i <= n; i++) {
                    const gross_i = baseInst + (i <= remainder ? 0.01 : 0);
                    const pctFee_i = Math.floor(gross_i * T_card * 100) / 100;
                    const fixedFee_i = Math.floor((fixedFee / n) * 100) / 100;
                    const fee_i = pctFee_i + fixedFee_i;
                    const net_i = gross_i - fee_i;
                    
                    installments.push({
                        gross: gross_i,
                        feeCard: fee_i,
                        netBeforeAnt: net_i
                    });
                    
                    calcFeeCard += fee_i;
                    calcLNet += net_i;
                }
                
                Fee_card = Math.round(calcFeeCard * 100) / 100;
                L_net = Math.round(calcLNet * 100) / 100;
            } else {
                Fee_card = 0;
                L_net = 0;
            }
            
            // Recalculate exact prepayment fees using the reverse-calculated installments
            let sumFeeAnt = 0;
            for (let i = 1; i <= n; i++) {
                if (selectedPrepayments.includes(i)) {
                    const Fi = installmentFactors[i - 1];
                    const instNet = installments[i - 1] ? installments[i - 1].netBeforeAnt : 0;
                    sumFeeAnt += instNet * (1 - Fi);
                }
            }
            Fee_ant = Math.round(Math.max(0, sumFeeAnt) * 100) / 100;
            V_received_installments = Math.round(Math.max(0, L_net - Fee_ant) * 100) / 100;
            V_received = V_down_net + V_received_installments;
            
            V_buyer = activeDownPaymentVal + V_buyer_installments;
        }

        const totalFees = Fee_card + Fee_ant + Fee_down;
        const effectiveCostPct = V_buyer > 0 ? (totalFees / V_buyer) * 100 : 0;
        const instVal = Math.round((V_buyer_installments / n) * 100) / 100;

        return {
            n,
            V_buyer,
            instVal,
            Fee_card,
            L_net,
            Fee_ant,
            V_received,
            totalFees,
            effectiveCostPct,
            antRatePct: (1 - F_ant) * 100,
            selectedPrepayments,
            installmentFactors,
            installments,
            
            // Down payment breakdown
            hasDownPayment,
            downPaymentVal: activeDownPaymentVal,
            originalDownPaymentVal: downPaymentVal,
            downPaymentRate,
            downPaymentMethod: state.downPaymentMethod,
            V_down_net,
            Fee_down,
            V_buyer_installments,
            V_received_installments,
            downPaymentErrorActive
        };
    };

    // Helper to get card rate based on installment number
    const getCardRateForInstallment = (n) => {
        if (n === 1) return state.cardRate1;
        if (n >= 2 && n <= 6) return state.cardRate2_6;
        if (n >= 7 && n <= 12) return state.cardRate7_12;
        if (n >= 13 && n <= 21) return state.cardRate13_21;
        return state.cardRate13_21;
    };

    // Calculate details for installments up to the selected installment count
    const calculateAllInstallments = () => {
        const results = [];
        for (let i = 1; i <= state.selectedInstallment; i++) {
            const activeCardRate = getCardRateForInstallment(i);
            const activePrepaymentRate = (i === 1) ? state.antRateVista : state.antRateParc;
            
            // Pass user's selective prepayments array only for the actively selected installment count
            const prepayments = (i === state.selectedInstallment) ? state.selectedPrepayments : null;
            
            results.push(calculateInstallmentDetails(
                i,
                state.baseValue,
                activeCardRate,
                state.fixedFee,
                activePrepaymentRate,
                state.prepaymentModel,
                state.absorptionModel,
                prepayments
            ));
        }
        return results;
    };

    // Render Stats Dashboard
    const renderDashboard = (activeDetails) => {
        // Total Paid
        elements.valTotalPaid.textContent = formatBRL(activeDetails.V_buyer);
        
        if (activeDetails.hasDownPayment) {
            elements.subTotalPaid.textContent = `Entrada de ${formatBRL(activeDetails.downPaymentVal)} + ${activeDetails.n}x de ${formatBRL(activeDetails.instVal)}`;
        } else {
            elements.subTotalPaid.textContent = `${activeDetails.n}x de ${formatBRL(activeDetails.instVal)}`;
        }
        
        // Total Fees
        elements.valTotalFees.textContent = formatBRL(activeDetails.totalFees);
        const activeCardRate = getCardRateForInstallment(activeDetails.n);
        const cardPct = activeCardRate.toFixed(2) + '%';
        const antPct = activeDetails.antRatePct.toFixed(2) + '%';
        
        const downFeeDesc = activeDetails.hasDownPayment ? `${activeDetails.downPaymentRate.toFixed(2)}% entrada + ` : '';
        elements.subTotalFees.textContent = `${downFeeDesc}${cardPct} cartão + ${antPct} antecipação`;
        
        // Net Received
        elements.valNetReceived.textContent = formatBRL(activeDetails.V_received);
        
        // Effective Cost
        elements.valEffectiveCost.textContent = activeDetails.effectiveCostPct.toFixed(2) + '%';
        
        // Adjust labels based on absorb or pass
        if (state.absorptionModel === 'pass') {
            elements.labelTotalPaid.textContent = "Total Cobrado do Cliente";
            elements.valNetReceived.classList.remove('text-green');
            elements.valNetReceived.classList.add('text-primary');
            elements.valTotalPaid.classList.add('text-green');
        } else {
            elements.labelTotalPaid.textContent = "Total Pago pelo Cliente";
            elements.valTotalPaid.classList.remove('text-green');
            elements.valTotalPaid.classList.add('text-primary');
            elements.valNetReceived.classList.add('text-green');
        }
    };

    // Render Comparative Table
    const renderTable = (allResults) => {
        elements.comparisonTableBody.innerHTML = '';
        if (elements.tableSubtitle) {
            elements.tableSubtitle.textContent = `Compare valores recebidos e tarifas de 1x até ${state.selectedInstallment}x`;
        }
        
        allResults.forEach(res => {
            const tr = document.createElement('tr');
            if (res.n === state.selectedInstallment) {
                tr.classList.add('selected-row');
            }
            
            const netPct = 100 - res.effectiveCostPct;
            const feePct = res.effectiveCostPct;
            
            // Build the row elements with inline sparklines
            tr.innerHTML = `
                <td><strong>${res.n}x</strong></td>
                <td>${formatBRL(res.instVal)}</td>
                <td class="text-red">${formatBRL(res.Fee_card)}</td>
                <td class="text-red">${formatBRL(res.Fee_ant)}</td>
                <td class="text-green">${formatBRL(res.V_received)}</td>
                <td>
                    <div class="sparkline-wrapper">
                        <div class="sparkline-labels">
                            <span class="text-green">${netPct.toFixed(1)}%</span>
                            <span class="text-red">${feePct.toFixed(1)}%</span>
                        </div>
                        <div class="sparkline-bar">
                            <div class="sparkline-segment-net" style="width: ${netPct}%" title="Líquido Recebido: ${netPct.toFixed(1)}%"></div>
                            <div class="sparkline-segment-fee" style="width: ${feePct}%" title="Taxas Totais: ${feePct.toFixed(1)}%"></div>
                        </div>
                    </div>
                </td>
                <td style="text-align: right;">
                    <button class="row-action-btn" data-n="${res.n}" style="margin-left: auto;">
                        Detalhar <i data-lucide="chevron-right" style="width: 12px; height: 12px;"></i>
                    </button>
                </td>
            `;
            
            // Direct click on Detail button
            const actionBtn = tr.querySelector('.row-action-btn');
            actionBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering row selection on the row
                const n = parseInt(actionBtn.getAttribute('data-n'));
                showDetailedDrawer(n);
            });
            
            // Clicking row selects it
            tr.addEventListener('click', () => {
                state.selectedInstallment = res.n;
                elements.selectedInstallment.value = res.n;
                // Reset selective prepayments to all selected for the new installment count
                state.selectedPrepayments = Array.from({length: state.selectedInstallment}, (_, idx) => idx + 1);
                calculateAndRender();
            });
            
            elements.comparisonTableBody.appendChild(tr);
        });
        
        lucide.createIcons();
    };

    // Render SVG Interactive Chart representing active plan installments
    const renderChart = (activeDetails) => {
        elements.chartContainer.innerHTML = '';
        
        // Build the list of items to plot: down payment (if any) and individual installments
        const chartItems = [];
        
        // 1. Down Payment (Entrada) column
        if (activeDetails.hasDownPayment && activeDetails.downPaymentVal > 0) {
            chartItems.push({
                label: 'Entrada',
                gross: activeDetails.downPaymentVal,
                net: activeDetails.V_down_net,
                fee: activeDetails.Fee_down,
                isDownPayment: true
            });
        }
        
        // 2. Card Installment columns
        const n = activeDetails.n;
        
        for (let i = 1; i <= n; i++) {
            const inst = activeDetails.installments[i - 1];
            const grossInst = inst ? inst.gross : 0;
            const netInstBeforeAnt = inst ? inst.netBeforeAnt : 0;
            const cardFeeInst = inst ? inst.feeCard : 0;
            
            const Fi = activeDetails.installmentFactors[i - 1];
            const finalPaidInst = netInstBeforeAnt * Fi;
            const antFeeInst = netInstBeforeAnt - finalPaidInst;
            const totalFeeInst = cardFeeInst + antFeeInst;
            
            const isPrepaid = activeDetails.selectedPrepayments.includes(i);
            
            chartItems.push({
                label: `${i}ª Parc`,
                gross: grossInst,
                net: finalPaidInst,
                fee: totalFeeInst,
                isDownPayment: false,
                installmentIndex: i,
                isPrepaid: isPrepaid
            });
        }
        
        if (chartItems.length === 0) {
            return;
        }

        // Find max gross value to scale the bars correctly
        const maxVal = Math.max(...chartItems.map(item => item.gross), 100);
        
        // Viewport Dimensions
        const width = 800;
        const height = 220;
        const paddingLeft = 55;
        const paddingRight = 20;
        const paddingTop = 30;
        const paddingBottom = 30;
        
        const chartW = width - paddingLeft - paddingRight;
        const chartH = height - paddingTop - paddingBottom;
        const colW = chartW / chartItems.length;
        const barW = Math.max(12, colW - 6); // Spacing of 6px
        
        // Create main SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        svg.setAttribute('class', 'chart-svg');
        
        // Inject vertical linear gradients defs for premium light bar effects
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        defs.innerHTML = `
            <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="hsl(142, 70%, 50%)" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="hsl(142, 70%, 40%)" stop-opacity="0.2"/>
            </linearGradient>
            <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="hsl(347, 80%, 55%)" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="hsl(347, 80%, 45%)" stop-opacity="0.2"/>
            </linearGradient>
        `;
        svg.appendChild(defs);
        
        // Grid helper lines
        const gridLines = 3;
        for (let i = 0; i <= gridLines; i++) {
            const gridY = paddingTop + (chartH / gridLines) * i;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', paddingLeft);
            line.setAttribute('y1', gridY);
            line.setAttribute('x2', width - paddingRight);
            line.setAttribute('y2', gridY);
            line.setAttribute('stroke', 'var(--border-card)');
            line.setAttribute('stroke-dasharray', '4 4');
            svg.appendChild(line);
            
            // Grid Y labels
            const gridVal = maxVal - (maxVal / gridLines) * i;
            const textY = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textY.setAttribute('x', paddingLeft - 8);
            textY.setAttribute('y', gridY + 3);
            textY.setAttribute('class', 'chart-text');
            textY.setAttribute('style', 'text-anchor: end; font-size: 9px; fill: var(--text-dim);');
            textY.textContent = new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(gridVal);
            svg.appendChild(textY);
        }

        // Generate stacked columns
        chartItems.forEach((item, index) => {
            const x = paddingLeft + index * colW + (colW - barW) / 2;
            
            // Calculations for heights
            const hGreen = (item.net / maxVal) * chartH;
            const hRed = (item.fee / maxVal) * chartH;
            
            const yGreen = paddingTop + chartH - hGreen;
            const yRed = yGreen - hRed;
            
            // Create a bar group
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            let groupClass = 'chart-bar-group';
            if (item.isDownPayment) {
                groupClass += ' is-down-payment';
            } else if (item.isPrepaid) {
                groupClass += ' highlighted';
            }
            group.setAttribute('class', groupClass);
            
            // 1. Green Net Received Rect
            const rectGreen = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectGreen.setAttribute('x', x);
            rectGreen.setAttribute('y', yGreen);
            rectGreen.setAttribute('width', barW);
            rectGreen.setAttribute('height', Math.max(2, hGreen));
            rectGreen.setAttribute('fill', 'url(#netGradient)');
            rectGreen.setAttribute('rx', '4');
            group.appendChild(rectGreen);
            
            // 2. Red Fees Rect
            const rectRed = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rectRed.setAttribute('x', x);
            rectRed.setAttribute('y', yRed);
            rectRed.setAttribute('width', barW);
            rectRed.setAttribute('height', Math.max(2, hRed));
            rectRed.setAttribute('fill', 'url(#feeGradient)');
            rectRed.setAttribute('rx', '4');
            group.appendChild(rectRed);
            
            // 3. Highlight Border Overlay (for prepaid status or down payment status)
            if (item.isDownPayment || item.isPrepaid) {
                const rectBorder = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rectBorder.setAttribute('x', x - 1);
                rectBorder.setAttribute('y', yRed - 1);
                rectBorder.setAttribute('width', barW + 2);
                rectBorder.setAttribute('height', hGreen + hRed + 2);
                rectBorder.setAttribute('fill', 'none');
                rectBorder.setAttribute('stroke', item.isDownPayment ? 'var(--color-success)' : 'var(--color-primary)');
                rectBorder.setAttribute('stroke-width', '1.5');
                rectBorder.setAttribute('rx', '5');
                group.appendChild(rectBorder);
            }
            
            // 4. Bar Top value text (show total on hover)
            const textVal = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textVal.setAttribute('x', x + barW / 2);
            textVal.setAttribute('y', yRed - 6);
            textVal.setAttribute('class', 'chart-text-value');
            const textValOpacity = (item.isDownPayment || item.isPrepaid) ? '1' : '0';
            textVal.setAttribute('style', `fill: var(--text-primary); font-size: 9px; font-weight: 700; opacity: ${textValOpacity};`);
            textVal.textContent = new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(item.gross);
            group.appendChild(textVal);

            // 5. X Axis installment label
            const textX = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textX.setAttribute('x', x + barW / 2);
            textX.setAttribute('y', paddingTop + chartH + 18);
            textX.setAttribute('class', 'chart-text');
            
            let labelColor = 'var(--text-secondary)';
            let labelWeight = '600';
            if (item.isDownPayment) {
                labelColor = 'var(--color-success)';
                labelWeight = '700';
            } else if (item.isPrepaid) {
                labelColor = 'var(--color-primary)';
                labelWeight = '700';
            }
            textX.setAttribute('style', `fill: ${labelColor}; font-weight: ${labelWeight};`);
            textX.textContent = item.label;
            group.appendChild(textX);
            
            // Event listeners to handle interactive clicking for prepayment toggle
            if (!item.isDownPayment) {
                group.addEventListener('click', () => {
                    const idx = item.installmentIndex;
                    if (state.selectedPrepayments.includes(idx)) {
                        state.selectedPrepayments = state.selectedPrepayments.filter(val => val !== idx);
                    } else {
                        state.selectedPrepayments.push(idx);
                        state.selectedPrepayments.sort((a, b) => a - b);
                    }
                    calculateAndRender();
                });
            } else {
                group.style.cursor = 'default';
            }
            
            svg.appendChild(group);
        });
        
        // Base Axis Line
        const axisX = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        axisX.setAttribute('x1', paddingLeft);
        axisX.setAttribute('y1', paddingTop + chartH);
        axisX.setAttribute('x2', width - paddingRight);
        axisX.setAttribute('y2', paddingTop + chartH);
        axisX.setAttribute('class', 'chart-axis-line');
        svg.appendChild(axisX);
        
        elements.chartContainer.appendChild(svg);
    };

    // Render detailed sidebar drawer
    const showDetailedDrawer = (n) => {
        const activeCardRate = getCardRateForInstallment(n);
        const activePrepaymentRate = (n === 1) ? state.antRateVista : state.antRateParc;
        
        // Pass user's selective prepayments array only for the actively selected installment count
        const prepayments = (n === state.selectedInstallment) ? state.selectedPrepayments : null;
        
        const details = calculateInstallmentDetails(
            n,
            state.baseValue,
            activeCardRate,
            state.fixedFee,
            activePrepaymentRate,
            state.prepaymentModel,
            state.absorptionModel,
            prepayments
        );

        elements.drawerTitle.textContent = `Detalhamento da Simulação - ${n}x`;
        
        // Populate the dynamic cascade memory calculation list based on down payment status
        if (details.hasDownPayment) {
            const originalDownVal = details.originalDownPaymentVal;
            const discountAmount = originalDownVal * (state.cashDiscountPct / 100);
            
            let discountHtml = '';
            if (state.applyCashDiscount && discountAmount > 0) {
                discountHtml = `
                    <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-success); margin-left: 0.5rem; font-size: 0.88rem;">
                        <span class="flow-label">Valor de Entrada Nominal</span>
                        <span class="flow-value">${formatBRL(originalDownVal)}</span>
                    </li>
                    <li style="padding-left: 1.5rem; border-left: 2px solid var(--color-success); margin-left: 0.5rem; font-size: 0.85rem; color: var(--color-success);" class="text-green">
                        <span class="flow-label">[-] Desconto à Vista (${state.cashDiscountPct.toFixed(2)}%)</span>
                        <span class="flow-value">- ${formatBRL(discountAmount)}</span>
                    </li>
                `;
            }

            elements.calculationFlow.innerHTML = `
                <li>
                    <span class="flow-label"><strong>Valor Total Cobrado do Cliente</strong></span>
                    <span class="flow-value"><strong>${formatBRL(details.V_buyer)}</strong></span>
                </li>
                ${discountHtml}
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-success); margin-left: 0.5rem; font-size: 0.88rem;">
                    <span class="flow-label">Entrada Efetiva (${details.downPaymentMethod.toUpperCase()})</span>
                    <span class="flow-value">${formatBRL(details.downPaymentVal)}</span>
                </li>
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-success); margin-left: 0.5rem; font-size: 0.88rem;" class="text-red">
                    <span class="flow-label">[-] Taxa da Entrada (${details.downPaymentRate.toFixed(2)}%)</span>
                    <span class="flow-value">- ${formatBRL(details.Fee_down)}</span>
                </li>
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-success); margin-left: 0.5rem; font-size: 0.88rem;" class="text-green">
                    <span class="flow-label">[=] Líquido Recebido da Entrada</span>
                    <span class="flow-value"><strong>${formatBRL(details.V_down_net)}</strong></span>
                </li>
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-primary); margin-left: 0.5rem; margin-top: 0.5rem; font-size: 0.88rem;">
                    <span class="flow-label">[-] Saldo Financiado no Cartão</span>
                    <span class="flow-value">${formatBRL(details.V_buyer_installments)}</span>
                </li>
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-primary); margin-left: 0.5rem; font-size: 0.88rem;" class="text-red">
                    <span class="flow-label">[-] Taxa Intermediação Cartão</span>
                    <span class="flow-value">- ${formatBRL(details.Fee_card)}</span>
                </li>
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-primary); margin-left: 0.5rem; font-size: 0.88rem;" class="text-dim">
                    <span class="flow-label">[=] Líquido antes de antecipar</span>
                    <span class="flow-value">${formatBRL(details.L_net)}</span>
                </li>
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-primary); margin-left: 0.5rem; font-size: 0.88rem;" class="text-red">
                    <span class="flow-label">[-] Taxa de Antecipação</span>
                    <span class="flow-value">- ${formatBRL(details.Fee_ant)}</span>
                </li>
                <li style="padding-left: 0.75rem; border-left: 2px solid var(--color-primary); margin-left: 0.5rem; font-size: 0.88rem;" class="text-green">
                    <span class="flow-label">[=] Líquido Recebido do Parcelado</span>
                    <span class="flow-value"><strong>${formatBRL(details.V_received_installments)}</strong></span>
                </li>
                <li class="flow-total" style="border-top: 1px solid var(--border-card); margin-top: 0.75rem; padding-top: 0.75rem;">
                    <span class="flow-label text-green"><strong>Valor Líquido Recebido Total</strong></span>
                    <span class="flow-value text-green"><strong>${formatBRL(details.V_received)}</strong></span>
                </li>
            `;
        } else {
            let discountHtml = '';
            if (state.applyCashDiscount && (n === 1 || n === 2)) {
                const originalBaseVal = state.baseValue;
                const discountAmount = originalBaseVal * (state.cashDiscountPct / 100);
                const targetWithDiscount = originalBaseVal - discountAmount;
                
                if (state.absorptionModel === 'absorb') {
                    discountHtml = `
                        <li>
                            <span class="flow-label">Valor Original da Cobrança</span>
                            <span class="flow-value">${formatBRL(originalBaseVal)}</span>
                        </li>
                        <li class="text-green" style="padding-left: 0.75rem; border-left: 2px solid var(--color-success); margin-left: 0.5rem; font-size: 0.88rem;">
                            <span class="flow-label">[-] Desconto à Vista (${state.cashDiscountPct.toFixed(2)}%)</span>
                            <span class="flow-value">- ${formatBRL(discountAmount)}</span>
                        </li>
                    `;
                } else {
                    discountHtml = `
                        <li>
                            <span class="flow-label">Líquido Desejado Original</span>
                            <span class="flow-value">${formatBRL(originalBaseVal)}</span>
                        </li>
                        <li class="text-green" style="padding-left: 0.75rem; border-left: 2px solid var(--color-success); margin-left: 0.5rem; font-size: 0.88rem;">
                            <span class="flow-label">[-] Desconto à Vista (${state.cashDiscountPct.toFixed(2)}%)</span>
                            <span class="flow-value">- ${formatBRL(discountAmount)}</span>
                        </li>
                        <li style="font-size: 0.88rem; font-weight: 600; margin-bottom: 0.5rem;">
                            <span class="flow-label">Líquido Alvo com Desconto</span>
                            <span class="flow-value">${formatBRL(targetWithDiscount)}</span>
                        </li>
                    `;
                }
            }

            elements.calculationFlow.innerHTML = `
                ${discountHtml}
                <li style="border-top: ${discountHtml ? '1px dashed var(--border-card)' : 'none'}; padding-top: ${discountHtml ? '0.5rem' : '0'};">
                    <span class="flow-label">${state.absorptionModel === 'pass' ? 'Valor bruto cobrado do cliente' : (state.applyCashDiscount && (n === 1 || n === 2) ? 'Valor bruto com desconto' : 'Valor bruto cobrado')}</span>
                    <span class="flow-value"><strong>${formatBRL(details.V_buyer)}</strong></span>
                </li>
                <li class="text-red">
                    <span class="flow-label">[-] Taxa de intermediação (cartão)</span>
                    <span class="flow-value">- ${formatBRL(details.Fee_card)}</span>
                </li>
                <li class="flow-separator text-dim">
                    <span class="flow-label">[=] Líquido antes de antecipar</span>
                    <span class="flow-value">${formatBRL(details.L_net)}</span>
                </li>
                <li class="text-red">
                    <span class="flow-label">[-] Taxa de antecipação</span>
                    <span class="flow-value">- ${formatBRL(details.Fee_ant)}</span>
                </li>
                <li class="flow-total" style="border-top: 1px solid var(--border-card); margin-top: 0.75rem; padding-top: 0.75rem;">
                    <span class="flow-label text-green"><strong>Valor Líquido Recebido</strong></span>
                    <span class="flow-value text-green"><strong>${formatBRL(details.V_received)}</strong></span>
                </li>
            `;
        }
        
        // Dynamically update the table column header with the actual rate used
        elements.drawerTableDiscountHeader.textContent = `Desconto (${activePrepaymentRate.toFixed(2)}%/m)`;
        
        // Generate list of installments table in the drawer
        elements.drawerTableBody.innerHTML = '';
        
        for (let i = 1; i <= n; i++) {
            const inst = details.installments[i - 1];
            const netInstBeforeAnt = inst ? inst.netBeforeAnt : 0;
            const Fi = details.installmentFactors[i - 1];
            const finalPaidInst = netInstBeforeAnt * Fi;
            const discountInst = netInstBeforeAnt - finalPaidInst;
            
            const isPrepaid = prepayments ? prepayments.includes(i) : true;
            const statusLabel = isPrepaid ? 'D+1 útil' : `D+${i * 30} dias`;
            const statusClass = isPrepaid ? 'text-green' : 'text-dim';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${i}ª Parcela</strong></td>
                <td class="${statusClass}"><strong>${statusLabel}</strong></td>
                <td>${formatBRL(netInstBeforeAnt)}</td>
                <td>${isPrepaid ? i + ' mês' + (i > 1 ? 'es' : '') : '-'}</td>
                <td class="text-red">-${formatBRL(discountInst)}</td>
                <td class="text-green">${formatBRL(finalPaidInst)}</td>
            `;
            elements.drawerTableBody.appendChild(tr);
        }
        
        // Draw the vertical installment bar chart inside the drawer for this specific foccused plan!
        renderChart(details);
        
        elements.drawerOverlay.classList.add('active');
    };

    // Render selective prepayment panel list and metrics
    const renderSelectivePrepayment = (activeDetails) => {
        elements.selectiveList.innerHTML = '';
        
        const n = activeDetails.n;
        
        let totalAnt = 0; // Down payment is entry and should not be counted as prepayment of installments
        let totalFluxo = 0;
        const totalCost = activeDetails.Fee_ant; // Only prepayment costs of installments, excluding down payment fee
        const totalNet = activeDetails.V_received;
        
        for (let i = 1; i <= n; i++) {
            const inst = activeDetails.installments[i - 1];
            const netInstBeforeAnt = inst ? inst.netBeforeAnt : 0;
            const isPrepaid = state.selectedPrepayments.includes(i);
            const Fi = activeDetails.installmentFactors[i - 1];
            const finalPaidInst = netInstBeforeAnt * Fi;
            
            if (isPrepaid) {
                totalAnt += finalPaidInst;
            } else {
                totalFluxo += finalPaidInst;
            }
            
            const item = document.createElement('div');
            item.className = `selective-item ${isPrepaid ? 'prepaid' : ''}`;
            
            const badgeClass = isPrepaid ? 'bg-green' : 'bg-blue';
            const badgeLabel = isPrepaid ? 'D+1 útil' : `D+${i * 30} dias`;
            
            item.innerHTML = `
                <div class="selective-item-left">
                    <label class="switch">
                        <input type="checkbox" class="selective-toggle" data-i="${i}" ${isPrepaid ? 'checked' : ''}>
                        <span class="slider-switch"></span>
                    </label>
                    <span class="selective-label">${i}ª Parcela</span>
                    <span class="selective-badge ${badgeClass}">${badgeLabel}</span>
                </div>
                <div class="selective-item-right">
                    <span class="selective-val">${formatBRL(finalPaidInst)}</span>
                </div>
            `;
            
            // Wire checkbox toggle listener
            const toggle = item.querySelector('.selective-toggle');
            toggle.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-i'));
                if (e.target.checked) {
                    if (!state.selectedPrepayments.includes(idx)) {
                        state.selectedPrepayments.push(idx);
                        state.selectedPrepayments.sort((a, b) => a - b);
                    }
                } else {
                    state.selectedPrepayments = state.selectedPrepayments.filter(val => val !== idx);
                }
                calculateAndRender();
            });
            
            elements.selectiveList.appendChild(item);
        }
        
        // Update summary metrics
        elements.selValAnt.textContent = formatBRL(totalAnt);
        elements.selValFluxo.textContent = formatBRL(totalFluxo);
        elements.selValCost.textContent = formatBRL(totalCost);
        elements.selValNet.textContent = formatBRL(totalNet);
    };

    // Initialize quick actions for Selective Prepayment
    const initSelectivePrepayment = () => {
        elements.btnSelectAll.addEventListener('click', () => {
            state.selectedPrepayments = Array.from({length: state.selectedInstallment}, (_, idx) => idx + 1);
            calculateAndRender();
        });
        
        elements.btnDeselectAll.addEventListener('click', () => {
            state.selectedPrepayments = [];
            calculateAndRender();
        });
    };

    // Initialize scenarios / presets
    const initPresets = () => {
        if (elements.presetHybrid10x) {
            elements.presetHybrid10x.addEventListener('click', () => {
                state.baseValue = 16900.00;
                state.applyCashDiscount = false;
                state.cashDiscountPct = 7.00;
                state.hasDownPayment = true;
                state.downPaymentValue = 6900.00;
                state.downPaymentMethod = 'pix';
                state.downPaymentRate = 0.00;
                state.selectedInstallment = 10;
                state.selectedPrepayments = [];
                state.cardRate1 = 2.77;
                state.antRateVista = 1.25;
                state.fixedFee = 0.29;

                elements.chargeValue.value = "16.900,00";
                elements.applyCashDiscount.checked = false;
                elements.cashDiscountInputWrapper.style.opacity = '0.3';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'none';
                elements.cashDiscountPct.value = "7.00";
                elements.hasDownPayment.checked = true;
                elements.downPaymentPanel.classList.add('expanded');
                elements.downPaymentValue.value = "6.900,00";
                elements.downPaymentMethod.value = "pix";
                elements.downPaymentRate.value = "0.00";
                elements.selectedInstallment.value = "10";
                elements.cardRate1.value = "2.77";
                elements.antRateVista.value = "1.25";
                elements.fixedFee.value = "0.29";

                calculateAndRender();
            });
        }

        if (elements.presetVistaAnt) {
            elements.presetVistaAnt.addEventListener('click', () => {
                state.baseValue = 16900.00;
                state.applyCashDiscount = true;
                state.cashDiscountPct = 7.00;
                state.hasDownPayment = false;
                state.downPaymentValue = 0.00;
                state.selectedInstallment = 1;
                state.selectedPrepayments = [1];
                state.cardRate1 = 2.77;
                state.antRateVista = 1.25;
                state.fixedFee = 0.29;

                elements.chargeValue.value = "16.900,00";
                elements.applyCashDiscount.checked = true;
                elements.cashDiscountInputWrapper.style.opacity = '1';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'auto';
                elements.cashDiscountPct.value = "7.00";
                elements.hasDownPayment.checked = false;
                elements.downPaymentPanel.classList.remove('expanded');
                elements.downPaymentValue.value = "0,00";
                elements.selectedInstallment.value = "1";
                elements.cardRate1.value = "2.77";
                elements.antRateVista.value = "1.25";
                elements.fixedFee.value = "0.29";

                calculateAndRender();
            });
        }

        if (elements.presetVista2x) {
            elements.presetVista2x.addEventListener('click', () => {
                state.baseValue = 15717.00;
                state.applyCashDiscount = false;
                state.cashDiscountPct = 7.00;
                state.hasDownPayment = true;
                state.downPaymentValue = 7858.50;
                state.downPaymentMethod = 'pix';
                state.downPaymentRate = 0.00;
                state.selectedInstallment = 1;
                state.selectedPrepayments = [];
                state.cardRate1 = 0.00;
                state.antRateVista = 0.00;
                state.fixedFee = 0.00;

                elements.chargeValue.value = "15.717,00";
                elements.applyCashDiscount.checked = false;
                elements.cashDiscountInputWrapper.style.opacity = '0.3';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'none';
                elements.cashDiscountPct.value = "7.00";
                elements.hasDownPayment.checked = true;
                elements.downPaymentPanel.classList.add('expanded');
                elements.downPaymentValue.value = "7.858,50";
                elements.downPaymentMethod.value = "pix";
                elements.downPaymentRate.value = "0.00";
                elements.selectedInstallment.value = "1";
                elements.cardRate1.value = "0.00";
                elements.antRateVista.value = "0.00";
                elements.fixedFee.value = "0.00";

                calculateAndRender();
            });
        }

        if (elements.presetParc12x) {
            elements.presetParc12x.addEventListener('click', () => {
                state.baseValue = 16900.00;
                state.applyCashDiscount = false;
                state.cashDiscountPct = 7.00;
                state.hasDownPayment = false;
                state.downPaymentValue = 0.00;
                state.selectedInstallment = 12;
                state.selectedPrepayments = [];
                state.cardRate1 = 2.77;
                state.cardRate2_6 = 3.35;
                state.cardRate7_12 = 3.69;
                state.cardRate13_21 = 4.29;
                state.antRateVista = 1.25;
                state.antRateParc = 1.70;
                state.fixedFee = 0.29;

                elements.chargeValue.value = "16.900,00";
                elements.applyCashDiscount.checked = false;
                elements.cashDiscountInputWrapper.style.opacity = '0.3';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'none';
                elements.cashDiscountPct.value = "7.00";
                elements.hasDownPayment.checked = false;
                elements.downPaymentPanel.classList.remove('expanded');
                elements.downPaymentValue.value = "0,00";
                elements.selectedInstallment.value = "12";
                elements.cardRate1.value = "2.77";
                elements.cardRate2_6.value = "3.35";
                elements.cardRate7_12.value = "3.69";
                elements.cardRate13_21.value = "4.29";
                elements.antRateVista.value = "1.25";
                elements.antRateParc.value = "1.70";
                elements.fixedFee.value = "0.29";

                calculateAndRender();
            });
        }
    };

    // ==========================================
    // Scenario Comparer Side-by-Side Logic
    // ==========================================

    const generateScenarioTitle = (s) => {
        if (s.applyCashDiscount && s.selectedInstallment === 1) {
            return "À Vista Crédito 1x (c/ Desc.)";
        }
        if (s.hasDownPayment && s.downPaymentValue > 0) {
            const methodLabel = s.downPaymentMethod === 'pix' ? 'PIX' : 
                                s.downPaymentMethod === 'debit' ? 'Débito' : 
                                s.downPaymentMethod === 'credit1x' ? 'Crédito 1x' : 'Custom';
            return `Entrada ${methodLabel} + ${s.selectedInstallment}x`;
        }
        return `Financiamento ${s.selectedInstallment}x`;
    };

    const saveCurrentScenario = () => {
        if (state.comparedScenarios.length >= 3) {
            alert("Você já atingiu o limite de 3 cenários para comparação. Remova um cenário existente para adicionar um novo.");
            return;
        }

        const allResults = calculateAllInstallments();
        const activeDetails = allResults[state.selectedInstallment - 1];

        const stateCopy = {
            baseValue: state.baseValue,
            applyCashDiscount: state.applyCashDiscount,
            cashDiscountPct: state.cashDiscountPct,
            hasDownPayment: state.hasDownPayment,
            downPaymentValue: state.downPaymentValue,
            downPaymentMethod: state.downPaymentMethod,
            downPaymentRate: state.downPaymentRate,
            absorptionModel: state.absorptionModel,
            cardRate1: state.cardRate1,
            cardRate2_6: state.cardRate2_6,
            cardRate7_12: state.cardRate7_12,
            cardRate13_21: state.cardRate13_21,
            fixedFee: state.fixedFee,
            prepaymentType: state.prepaymentType,
            antRateVista: state.antRateVista,
            antRateParc: state.antRateParc,
            prepaymentModel: state.prepaymentModel,
            selectedInstallment: state.selectedInstallment,
            selectedPrepayments: [...state.selectedPrepayments]
        };

        const detailsCopy = {
            V_buyer: activeDetails.V_buyer,
            V_received: activeDetails.V_received,
            totalFees: activeDetails.totalFees,
            effectiveCostPct: activeDetails.effectiveCostPct,
            instVal: activeDetails.instVal,
            n: activeDetails.n,
            hasDownPayment: activeDetails.hasDownPayment,
            downPaymentVal: activeDetails.downPaymentVal,
            downPaymentMethod: activeDetails.downPaymentMethod,
            downPaymentRate: activeDetails.downPaymentRate,
            Fee_down: activeDetails.Fee_down,
            V_down_net: activeDetails.V_down_net,
            V_buyer_installments: activeDetails.V_buyer_installments,
            V_received_installments: activeDetails.V_received_installments,
            selectedPrepayments: [...activeDetails.selectedPrepayments],
            installmentFactors: [...activeDetails.installmentFactors],
            installments: activeDetails.installments.map(inst => ({ ...inst }))
        };

        state.comparedScenarios.push({
            state: stateCopy,
            details: detailsCopy,
            title: generateScenarioTitle(stateCopy)
        });

        renderScenarioComparer();
    };

    const removeScenario = (index) => {
        state.comparedScenarios.splice(index, 1);
        renderScenarioComparer();
    };

    const clearComparison = () => {
        state.comparedScenarios = [];
        renderScenarioComparer();
    };

    const loadScenario = (index) => {
        const saved = state.comparedScenarios[index];
        if (!saved) return;

        // Load state
        state = {
            ...state,
            baseValue: saved.state.baseValue,
            applyCashDiscount: saved.state.applyCashDiscount,
            cashDiscountPct: saved.state.cashDiscountPct,
            hasDownPayment: saved.state.hasDownPayment,
            downPaymentValue: saved.state.downPaymentValue,
            downPaymentMethod: saved.state.downPaymentMethod,
            downPaymentRate: saved.state.downPaymentRate,
            absorptionModel: saved.state.absorptionModel,
            cardRate1: saved.state.cardRate1,
            cardRate2_6: saved.state.cardRate2_6,
            cardRate7_12: saved.state.cardRate7_12,
            cardRate13_21: saved.state.cardRate13_21,
            fixedFee: saved.state.fixedFee,
            prepaymentType: saved.state.prepaymentType,
            antRateVista: saved.state.antRateVista,
            antRateParc: saved.state.antRateParc,
            prepaymentModel: saved.state.prepaymentModel,
            selectedInstallment: saved.state.selectedInstallment,
            selectedPrepayments: [...saved.state.selectedPrepayments]
        };

        // Update DOM inputs to match loaded state
        elements.chargeValue.value = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(state.baseValue);

        elements.applyCashDiscount.checked = state.applyCashDiscount;
        if (state.applyCashDiscount) {
            elements.cashDiscountInputWrapper.style.opacity = '1';
            elements.cashDiscountInputWrapper.style.pointerEvents = 'auto';
        } else {
            elements.cashDiscountInputWrapper.style.opacity = '0.3';
            elements.cashDiscountInputWrapper.style.pointerEvents = 'none';
        }
        elements.cashDiscountPct.value = state.cashDiscountPct.toFixed(2);

        elements.hasDownPayment.checked = state.hasDownPayment;
        if (state.hasDownPayment) {
            elements.downPaymentPanel.classList.add('expanded');
        } else {
            elements.downPaymentPanel.classList.remove('expanded');
        }
        elements.downPaymentValue.value = new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(state.downPaymentValue);
        elements.downPaymentMethod.value = state.downPaymentMethod;
        elements.downPaymentRate.value = state.downPaymentRate.toFixed(2);

        elements.selectedInstallment.value = state.selectedInstallment;

        // Segment controls
        if (state.absorptionModel === 'absorb') {
            elements.btnAbsorb.classList.add('active');
            elements.btnPass.classList.remove('active');
            elements.helperTitle.textContent = "Como funciona o cálculo?";
            elements.helperText.innerHTML = "No modo <strong>Vendedor Absorve</strong>, o comprador paga o valor nominal de sua venda. As taxas do cartão e de antecipação são deduzidas, reduzindo o seu repasse líquido.";
        } else {
            elements.btnPass.classList.add('active');
            elements.btnAbsorb.classList.remove('active');
            elements.helperTitle.textContent = "Como funciona o repasse?";
            elements.helperText.innerHTML = "No modo <strong>Repasse ao Cliente</strong>, recalculamos o valor cobrado do comprador para que, após descontadas todas as taxas, você receba <strong>exatamente</strong> o valor desejado.";
        }

        if (state.prepaymentType === 'manual') {
            elements.btnAntManual.classList.add('active');
            elements.btnAntAuto.classList.remove('active');
        } else {
            elements.btnAntAuto.classList.add('active');
            elements.btnAntManual.classList.remove('active');
        }

        elements.cardRate1.value = state.cardRate1.toFixed(2);
        elements.cardRate2_6.value = state.cardRate2_6.toFixed(2);
        elements.cardRate7_12.value = state.cardRate7_12.toFixed(2);
        elements.cardRate13_21.value = state.cardRate13_21.toFixed(2);
        elements.fixedFee.value = state.fixedFee.toFixed(2);
        elements.antRateVista.value = state.antRateVista.toFixed(2);
        elements.antRateParc.value = state.antRateParc.toFixed(2);
        elements.prepaymentModel.value = state.prepaymentModel;

        // Run recalculation and update UI
        calculateAndRender();
    };

    const renderScenarioComparer = () => {
        if (!elements.comparerCard || !elements.comparerGrid) return;

        if (state.comparedScenarios.length === 0) {
            elements.comparerCard.style.display = 'none';
            elements.comparerGrid.innerHTML = '';
            return;
        }

        elements.comparerCard.style.display = 'block';
        elements.comparerGrid.innerHTML = '';

        let minFees = Infinity;
        let minCostPct = Infinity;
        
        if (state.comparedScenarios.length > 1) {
            state.comparedScenarios.forEach(sc => {
                if (sc.details.totalFees < minFees) {
                    minFees = sc.details.totalFees;
                }
                if (sc.details.effectiveCostPct < minCostPct) {
                    minCostPct = sc.details.effectiveCostPct;
                }
            });
        }

        state.comparedScenarios.forEach((sc, idx) => {
            const isBestChoice = state.comparedScenarios.length > 1 && sc.details.totalFees === minFees;
            const column = document.createElement('div');
            column.className = `compared-column ${isBestChoice ? 'best-choice' : ''}`;

            let totalFluxo = 0;
            sc.details.installments.forEach((inst, i) => {
                const isPrepaid = sc.details.selectedPrepayments.includes(i + 1);
                const Fi = sc.details.installmentFactors[i];
                const finalPaidInst = inst.netBeforeAnt * Fi;
                if (!isPrepaid) {
                    totalFluxo += finalPaidInst;
                }
            });

            let availabilityText = "";
            if (sc.details.selectedPrepayments.length === sc.details.n) {
                availabilityText = "100% em D+1";
            } else if (sc.details.selectedPrepayments.length === 0) {
                availabilityText = "Mês a mês no fluxo";
            } else {
                availabilityText = `${formatBRL(totalFluxo)} no fluxo`;
            }

            let installmentInfoText = "";
            if (sc.details.hasDownPayment && sc.details.downPaymentVal > 0) {
                installmentInfoText = `Entrada: ${formatBRL(sc.details.downPaymentVal)} + ${sc.details.n}x de ${formatBRL(sc.details.instVal)}`;
            } else {
                installmentInfoText = `${sc.details.n}x de ${formatBRL(sc.details.instVal)}`;
            }

            const absorptionLabel = sc.state.absorptionModel === 'pass' ? "Cobrado do Cliente" : "Pago pelo Cliente";

            let badgesHtml = "";
            if (state.comparedScenarios.length > 1) {
                if (sc.details.totalFees === minFees) {
                    badgesHtml += `
                        <span class="compared-badge badge-green">
                            <i data-lucide="trending-down" style="width: 11px; height: 11px;"></i> Econômico
                        </span>
                    `;
                }
                if (totalFluxo === 0) {
                    badgesHtml += `
                        <span class="compared-badge badge-blue">
                            <i data-lucide="zap" style="width: 11px; height: 11px;"></i> Rápido
                        </span>
                    `;
                }
                if (sc.details.effectiveCostPct === minCostPct) {
                    badgesHtml += `
                        <span class="compared-badge badge-purple">
                            <i data-lucide="activity" style="width: 11px; height: 11px;"></i> Eficiente
                        </span>
                    `;
                }
            }

            column.innerHTML = `
                <div class="compared-header">
                    <div class="compared-title-area">
                        <span class="compared-title">${sc.title}</span>
                        <span class="compared-config">Cobrança: ${formatBRL(sc.state.baseValue)} | ${sc.state.absorptionModel === 'pass' ? 'Repasse' : 'Absorve'}</span>
                    </div>
                    <button class="btn-compared-remove" data-index="${idx}" title="Remover Cenário">
                        <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
                <div class="compared-metrics">
                    <div class="compared-metric-group">
                        <span class="compared-metric-label">Líquido Recebido</span>
                        <span class="compared-metric-value large text-green">${formatBRL(sc.details.V_received)}</span>
                        <span class="compared-metric-sub">Disponibilidade: ${availabilityText}</span>
                    </div>
                    <div class="compared-metric-group">
                        <span class="compared-metric-label">Total de Taxas</span>
                        <span class="compared-metric-value text-red">${formatBRL(sc.details.totalFees)}</span>
                        <span class="compared-metric-sub">Custo Efetivo: ${sc.details.effectiveCostPct.toFixed(2)}%</span>
                    </div>
                    <div class="compared-metric-group">
                        <span class="compared-metric-label">${absorptionLabel}</span>
                        <span class="compared-metric-value">${formatBRL(sc.details.V_buyer)}</span>
                        <span class="compared-metric-sub">${installmentInfoText}</span>
                    </div>
                </div>
                <div class="compared-badges">
                    ${badgesHtml}
                </div>
                <button class="btn-compared-load" data-index="${idx}">
                    <i data-lucide="play" style="width: 12px; height: 12px;"></i> Carregar Cenário
                </button>
            `;

            column.querySelector('.btn-compared-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                removeScenario(idx);
            });

            column.querySelector('.btn-compared-load').addEventListener('click', (e) => {
                e.stopPropagation();
                loadScenario(idx);
            });

            elements.comparerGrid.appendChild(column);
        });

        lucide.createIcons();
    };

    const initComparer = () => {
        if (elements.btnSaveToComparer) {
            elements.btnSaveToComparer.addEventListener('click', () => {
                saveCurrentScenario();
            });
        }
        if (elements.btnClearComparison) {
            elements.btnClearComparison.addEventListener('click', () => {
                clearComparison();
            });
        }
    };

    // Render Dynamic Financial Advisor Insights
    const renderOptimizer = (activeDetails, allResults) => {
        if (!elements.optimizerInsightsContainer) return;
        
        elements.optimizerInsightsContainer.innerHTML = '';
        const insights = [];
        
        // 1. Opportunity to add Down Payment
        if (!state.hasDownPayment && state.baseValue > 100) {
            const hypoDetails = calculateInstallmentDetails(
                state.selectedInstallment,
                state.baseValue,
                getCardRateForInstallment(state.selectedInstallment),
                state.fixedFee,
                (state.selectedInstallment === 1) ? state.antRateVista : state.antRateParc,
                state.prepaymentModel,
                state.absorptionModel,
                state.selectedPrepayments,
                true,
                state.baseValue * 0.20,
                0.00
            );
            const savings = Math.max(0, activeDetails.totalFees - hypoDetails.totalFees);
            if (savings > 5) {
                insights.push({
                    type: 'success-cost',
                    iconClass: 'success',
                    icon: 'trending-down',
                    title: 'Otimização com Entrada (20%)',
                    text: `Se o cliente pagar **20% de entrada (${formatBRL(state.baseValue * 0.20)})** via Pix (0% taxa), você reduz o saldo financiado no cartão e economiza **${formatBRL(savings)}** em taxas totais!`
                });
            }
        }
        
        // 2. Already has Down Payment - show active impact
        if (state.hasDownPayment && state.downPaymentValue > 0) {
            const hypoDetailsNoDown = calculateInstallmentDetails(
                state.selectedInstallment,
                state.baseValue,
                getCardRateForInstallment(state.selectedInstallment),
                state.fixedFee,
                (state.selectedInstallment === 1) ? state.antRateVista : state.antRateParc,
                state.prepaymentModel,
                state.absorptionModel,
                state.selectedPrepayments,
                false,
                0.00
            );
            const activeSavings = Math.max(0, hypoDetailsNoDown.totalFees - activeDetails.totalFees);
            if (activeSavings > 1) {
                insights.push({
                    type: 'primary-cost',
                    iconClass: 'primary',
                    icon: 'sparkles',
                    title: 'Entrada Reduzindo Custos',
                    text: `Excelente escolha! A entrada de **${formatBRL(activeDetails.downPaymentVal)}** reduz o saldo do cartão e economiza **${formatBRL(activeSavings)}** comparado a uma venda sem entrada.`
                });
            }
        }
        
        // 3. Installment break-even threshold advice (Lower installment recommended) - Bug Fixed Order
        if (state.selectedInstallment > 12) {
            const res12 = allResults[11]; // 12x
            const feeReduction12 = Math.max(0, activeDetails.totalFees - res12.totalFees);
            if (feeReduction12 > 5) {
                insights.push({
                    type: 'info-cost',
                    iconClass: 'info',
                    icon: 'activity',
                    title: 'Evite Faixas Altas (12x)',
                    text: `Ao reduzir de ${state.selectedInstallment}x para **12x**, você evita a faixa mais cara do cartão (13x-21x) e economiza **${formatBRL(feeReduction12)}** em tarifas.`
                });
            }
        } else if (state.selectedInstallment > 6) {
            const res6 = allResults[5]; // 6x
            const feeReduction = Math.max(0, activeDetails.totalFees - res6.totalFees);
            if (feeReduction > 5) {
                insights.push({
                    type: 'info-cost',
                    iconClass: 'info',
                    icon: 'activity',
                    title: 'Melhor Custo-Benefício em 6x',
                    text: `Ao oferecer o parcelamento em **6x** ao invés de ${state.selectedInstallment}x, as taxas totais caem para **${formatBRL(res6.totalFees)}**, garantindo uma economia de **${formatBRL(feeReduction)}**!`
                });
            }
        }
        
        // 4. Selective Prepayment Advice
        if (state.selectedInstallment >= 4 && state.selectedPrepayments.length === state.selectedInstallment) {
            const last2Excluded = state.selectedPrepayments.filter(i => i < state.selectedInstallment - 1);
            const hypoDetailsLast2 = calculateInstallmentDetails(
                state.selectedInstallment,
                state.baseValue,
                getCardRateForInstallment(state.selectedInstallment),
                state.fixedFee,
                (state.selectedInstallment === 1) ? state.antRateVista : state.antRateParc,
                state.prepaymentModel,
                state.absorptionModel,
                last2Excluded
            );
            const antSavings = Math.max(0, activeDetails.Fee_ant - hypoDetailsLast2.Fee_ant);
            if (antSavings > 5) {
                insights.push({
                    type: 'warning-cost',
                    iconClass: 'danger',
                    icon: 'alert-triangle',
                    title: 'Dica de Antecipação Seletiva',
                    text: `As parcelas finais sofrem maior desconto pelo tempo de espera. Ao receber as **duas últimas parcelas (${state.selectedInstallment - 1}ª e ${state.selectedInstallment}ª)** no fluxo original (desmarcando-as abaixo), você economiza **${formatBRL(antSavings)}** em juros!`
                });
            }
        }

        // 5. Fee Pass-through Recommendation
        if (state.absorptionModel === 'absorb' && activeDetails.totalFees > (activeDetails.V_buyer * 0.08)) {
            const feePct = ((activeDetails.totalFees / activeDetails.V_buyer) * 100).toFixed(2);
            insights.push({
                type: 'warning-cost',
                iconClass: 'danger',
                icon: 'arrow-right-left',
                title: 'Dica de Repasse de Tarifas',
                text: `Você está absorvendo **${formatBRL(activeDetails.totalFees)}** em taxas nesta transação (que representa **${feePct}%** do total). Ative a opção **Repasse ao Cliente** nas configurações de venda para receber o valor integral de **${formatBRL(state.baseValue)}** livre de taxas!`
            });
        }

        // 6. Cash Discount Promotion
        if (state.selectedInstallment >= 4 && !state.applyCashDiscount) {
            insights.push({
                type: 'info-cost',
                iconClass: 'info',
                icon: 'percent',
                title: 'Negociação à Vista Estratégica',
                text: `Se o comprador puder pagar à vista, oferecer o **Desconto de À Vista (7% de Desconto)** com pagamento via Pix (Cenário 4) gera um custo total de **${formatBRL(state.baseValue * 0.93)}** para ele (economia de **${formatBRL(state.baseValue * 0.07)}**) e você recebe o valor líquido imediatamente livre de taxas de cartão ou juros de antecipação!`
            });
        }

        // 7. More Efficient Down Payment (PIX vs credit/debit)
        if (state.hasDownPayment && state.downPaymentValue > 0 && state.downPaymentMethod !== 'pix') {
            const currentMethodLabel = state.downPaymentMethod === 'debit' ? 'Cartão de Débito' : (state.downPaymentMethod === 'credit1x' ? 'Cartão de Crédito 1x' : 'Taxa Customizada');
            insights.push({
                type: 'primary-cost',
                iconClass: 'primary',
                icon: 'wallet',
                title: 'Entrada via PIX Sem Taxas',
                text: `A sua entrada de **${formatBRL(activeDetails.downPaymentVal)}** está configurada no método **${currentMethodLabel}**, gerando **${formatBRL(activeDetails.Fee_down)}** de tarifas de entrada. Sugerir o pagamento dessa entrada via **PIX ou Dinheiro** para zerar essa taxa e economizar esse valor líquido!`
            });
        }

        // 8. Conservative Cash Flow / No Prepayment Active Advice
        if (state.selectedInstallment >= 3 && state.selectedPrepayments.length === 0) {
            const hypoDetailsAllPrepaid = calculateInstallmentDetails(
                state.selectedInstallment,
                state.baseValue,
                getCardRateForInstallment(state.selectedInstallment),
                state.fixedFee,
                (state.selectedInstallment === 1) ? state.antRateVista : state.antRateParc,
                state.prepaymentModel,
                state.absorptionModel,
                Array.from({length: state.selectedInstallment}, (_, idx) => idx + 1)
            );
            const antSavings = Math.max(0, hypoDetailsAllPrepaid.Fee_ant);
            if (antSavings > 5) {
                insights.push({
                    type: 'success-cost',
                    iconClass: 'success',
                    icon: 'coins',
                    title: 'Fluxo de Caixa Conservador',
                    text: `Ótimo! Você está economizando **${formatBRL(antSavings)}** em juros de antecipação ao optar por receber as parcelas mês a mês no fluxo original. Se precisar de liquidez imediata, pode utilizar a **Antecipação Seletiva** apenas nas primeiras parcelas para receber caixa rápido com custo reduzido!`
                });
            }
        }

        // 9. Savings from Selective Prepayment selection
        if (state.selectedInstallment >= 3 && state.selectedPrepayments.length > 0 && state.selectedPrepayments.length < state.selectedInstallment) {
            const hypoDetailsAll = calculateInstallmentDetails(
                state.selectedInstallment,
                state.baseValue,
                getCardRateForInstallment(state.selectedInstallment),
                state.fixedFee,
                (state.selectedInstallment === 1) ? state.antRateVista : state.antRateParc,
                state.prepaymentModel,
                state.absorptionModel,
                Array.from({length: state.selectedInstallment}, (_, idx) => idx + 1)
            );
            const selectiveSavings = Math.max(0, hypoDetailsAll.Fee_ant - activeDetails.Fee_ant);
            if (selectiveSavings > 1) {
                insights.push({
                    type: 'success-cost',
                    iconClass: 'success',
                    icon: 'sliders',
                    title: 'Custo Otimizado com Seleção',
                    text: `Sua antecipação personalizada está gerando resultados! Ao receber apenas **${state.selectedPrepayments.length} de ${state.selectedInstallment}** parcelas em D+1, você reduziu os juros e economizou **${formatBRL(selectiveSavings)}** em relação à antecipação total.`
                });
            }
        }
        
        // Render all accumulated insights
        if (insights.length === 0) {
            insights.push({
                type: 'success-cost',
                iconClass: 'success',
                icon: 'sparkles',
                title: 'Simulação Altamente Eficiente',
                text: `Parabéns! Sua simulação atual possui uma estrutura de tarifas equilibrada e custo efetivo otimizado.`
            });
        }
        
        insights.forEach(ins => {
            const row = document.createElement('div');
            row.className = `insight-row ${ins.type}`;
            const formattedText = ins.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            row.innerHTML = `
                <div class="insight-icon-container ${ins.iconClass}">
                    <i data-lucide="${ins.icon}" style="width: 18px; height: 18px;"></i>
                </div>
                <div class="insight-content">
                    <span class="insight-title">${ins.title}</span>
                    <span class="insight-text">${formattedText}</span>
                </div>
            `;
            elements.optimizerInsightsContainer.appendChild(row);
        });
        
        lucide.createIcons();
    };

    // Orchestrator function called whenever state changes
    const calculateAndRender = () => {
        const allResults = calculateAllInstallments();
        const activeDetails = allResults[state.selectedInstallment - 1];
        
        // Toggle down payment error visibility and dynamic wording
        if (activeDetails.downPaymentErrorActive) {
            elements.downPaymentError.style.display = 'block';
            if (state.absorptionModel === 'pass') {
                elements.downPaymentError.innerHTML = `<i data-lucide="alert-triangle" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> A entrada líquida (${formatBRL(activeDetails.V_down_net)}) não pode ser maior ou igual ao líquido desejado (${formatBRL(state.baseValue)}).`;
            } else {
                elements.downPaymentError.innerHTML = `<i data-lucide="alert-triangle" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-right: 4px;"></i> A entrada bruta (${formatBRL(activeDetails.downPaymentVal)}) não pode ser maior ou igual ao total cobrado (${formatBRL(state.baseValue)}).`;
            }
            lucide.createIcons();
        } else {
            elements.downPaymentError.style.display = 'none';
        }

        renderDashboard(activeDetails);
        renderTable(allResults);
        renderChart(activeDetails);
        renderSelectivePrepayment(activeDetails);
        renderOptimizer(activeDetails, allResults);
    };

    // Initializer Sequence
    const init = () => {
        initCurrencyMask();
        initThemeToggle();
        initSegmentedControl();
        initPrepaymentToggle();
        initDownPayment();
        initInputs();
        initDrawer();
        initSelectivePrepayment();
        initPresets();
        initComparer();
        renderScenarioComparer();
        
        // Initial Preset Load (Default to Scenario 1 / presetHybrid10x)
        if (elements.presetHybrid10x) {
            elements.presetHybrid10x.click();
        } else {
            // Sync Cash Discount visual state on load (fallback)
            if (state.applyCashDiscount) {
                elements.applyCashDiscount.checked = true;
                elements.cashDiscountInputWrapper.style.opacity = '1';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'auto';
            } else {
                elements.applyCashDiscount.checked = false;
                elements.cashDiscountInputWrapper.style.opacity = '0.3';
                elements.cashDiscountInputWrapper.style.pointerEvents = 'none';
            }
            elements.cashDiscountPct.value = state.cashDiscountPct.toFixed(2);

            // Initial Calculation
            calculateAndRender();
        }
    };

    // Start App
    init();
});
