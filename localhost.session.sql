SELECT *
FROM new_patients AS p
 INNER JOIN billing AS b ON p.PATIENTID = b.PATIENTID
 INNER JOIN performing_test as t ON b.BILLINGID = t.BILLINGID