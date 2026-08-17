from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from io import BytesIO
from models.schemas import ReportRequest
import pandas as pd

def generate_report_pdf(report_data: ReportRequest) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    elements = []
    
    # Cover Page
    elements.append(Paragraph("FinSight", title_style))
    elements.append(Paragraph("Personal Finance & Expense Analytics Report", subtitle_style))
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Generated for: {report_data.user.name} ({report_data.user.email})", normal_style))
    elements.append(Paragraph(f"Period: {report_data.period.start} to {report_data.period.end}", normal_style))
    elements.append(Spacer(1, 30))
    
    # Executive Summary
    df = pd.DataFrame([tx.model_dump() for tx in report_data.transactions])
    if not df.empty:
        income = df[df['amount'] > 0]['amount'].sum()
        expenses = df[df['amount'] < 0]['amount'].abs().sum()
        savings = income - expenses
        savings_rate = (savings / income * 100) if income > 0 else 0
        
        elements.append(Paragraph("Executive Summary", subtitle_style))
        summary_data = [
            ["Total Income", f"INR {income:,.2f}"],
            ["Total Expenses", f"INR {expenses:,.2f}"],
            ["Net Savings", f"INR {savings:,.2f}"],
            ["Savings Rate", f"{savings_rate:.1f}%"]
        ]
        t_summary = Table(summary_data, colWidths=[200, 200])
        t_summary.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.white),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey)
        ]))
        elements.append(t_summary)
        elements.append(Spacer(1, 20))
        
        # Expense Breakdown
        elements.append(Paragraph("Expense Breakdown", subtitle_style))
        expense_df = df[df['amount'] < 0].copy()
        if not expense_df.empty:
            expense_df['amount_abs'] = expense_df['amount'].abs()
            breakdown = expense_df.groupby('category')['amount_abs'].sum().reset_index()
            breakdown = breakdown.sort_values('amount_abs', ascending=False)
            
            breakdown_data = [["Category", "Amount", "% of Total"]]
            for _, row in breakdown.iterrows():
                pct = (row['amount_abs'] / expenses * 100)
                breakdown_data.append([row['category'], f"INR {row['amount_abs']:,.2f}", f"{pct:.1f}%"])
                
            t_breakdown = Table(breakdown_data, colWidths=[150, 150, 100])
            t_breakdown.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey)
            ]))
            elements.append(t_breakdown)
            elements.append(Spacer(1, 20))

    # Smart Insights
    if report_data.insights:
        elements.append(Paragraph("Smart Insights", subtitle_style))
        for insight in report_data.insights:
            elements.append(Paragraph(f"• {insight.message}", normal_style))
        elements.append(Spacer(1, 20))
        
    doc.build(elements)
    
    return buffer.getvalue()
